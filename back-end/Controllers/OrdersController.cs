using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Api.Data;
using RetailOrdering.Api.Models;

namespace RetailOrdering.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public OrdersController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private string GetCurrentUserEmail()
    {
        return User.FindFirst(ClaimTypes.Email)?.Value ?? "user@example.com";
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var userId = GetCurrentUserId();
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Item)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new
            {
                o.Id,
                o.OrderDate,
                o.TotalAmount,
                o.Status,
                o.PaymentMethod,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.Id,
                    oi.ItemId,
                    ItemName = oi.Item != null ? oi.Item.Name : string.Empty,
                    Price = oi.Price,
                    oi.Quantity,
                    Category = oi.Item != null ? oi.Item.Category : string.Empty
                })
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto dto)
    {
        var userId = GetCurrentUserId();
        var email = GetCurrentUserEmail();
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return Unauthorized();
        }

        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            PaymentMethod = dto.PaymentMethod,
            Status = "Pending"
        };

        decimal total = 0;

        if (dto.IsFromCart)
        {
            // Fetch items from user's cart
            var cartItems = await _context.CartItems
                .Include(c => c.Item)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
            {
                return BadRequest(new { message = "Cart is empty." });
            }

            foreach (var cart in cartItems)
            {
                if (cart.Item == null) continue;
                var orderItem = new OrderItem
                {
                    ItemId = cart.ItemId,
                    Quantity = cart.Quantity,
                    Price = cart.Item.Price
                };
                order.OrderItems.Add(orderItem);
                total += cart.Item.Price * cart.Quantity;
            }

            // Remove cart items since they are checked out
            _context.CartItems.RemoveRange(cartItems);
        }
        else
        {
            // Direct booking of single item
            if (dto.DirectItem == null)
            {
                return BadRequest(new { message = "No items specified to order." });
            }

            var item = await _context.Items.FindAsync(dto.DirectItem.ItemId);
            if (item == null)
            {
                return NotFound(new { message = $"Item ID {dto.DirectItem.ItemId} not found." });
            }

            var orderItem = new OrderItem
            {
                ItemId = item.Id,
                Quantity = dto.DirectItem.Quantity,
                Price = item.Price
            };
            order.OrderItems.Add(orderItem);
            total = item.Price * dto.DirectItem.Quantity;
        }

        order.TotalAmount = total;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Simulate sending email
        await SendConfirmationEmail(email, user.Username, order);

        return Ok(new { message = "Order placed successfully.", orderId = order.Id });
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = GetCurrentUserId();
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        if (order == null)
        {
            return NotFound(new { message = "Order not found." });
        }

        if (order.Status.ToLower() == "cancelled")
        {
            return BadRequest(new { message = "Order is already cancelled." });
        }

        order.Status = "Cancelled";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Order cancelled successfully." });
    }

    private async Task SendConfirmationEmail(string toEmail, string username, Order order)
    {
        var subject = $"Order Confirmation #{order.Id} - Retail Ordering System";
        var bodyBuilder = new System.Text.StringBuilder();
        bodyBuilder.AppendLine($"Hello {username},");
        bodyBuilder.AppendLine();
        bodyBuilder.AppendLine("Thank you for your order! Your retail order has been received and is being processed.");
        bodyBuilder.AppendLine();
        bodyBuilder.AppendLine($"Order ID: {order.Id}");
        bodyBuilder.AppendLine($"Date: {order.OrderDate.ToLocalTime()}");
        bodyBuilder.AppendLine($"Payment Method: {order.PaymentMethod}");
        bodyBuilder.AppendLine($"Total Amount: ${order.TotalAmount:F2}");
        bodyBuilder.AppendLine();
        bodyBuilder.AppendLine("Items Ordered:");
        
        // Reload items details if not loaded
        var items = await _context.OrderItems
            .Include(oi => oi.Item)
            .Where(oi => oi.OrderId == order.Id)
            .ToListAsync();

        foreach (var item in items)
        {
            bodyBuilder.AppendLine($"- {item.Item?.Name} (x{item.Quantity}) - ${(item.Price * item.Quantity):F2}");
        }

        bodyBuilder.AppendLine();
        bodyBuilder.AppendLine("Status: Pending confirmation");
        bodyBuilder.AppendLine();
        bodyBuilder.AppendLine("Best Regards,");
        bodyBuilder.AppendLine("Retail Ordering System Team");

        var content = bodyBuilder.ToString();

        // Print to log file in the project
        var logDir = Path.Combine(_env.ContentRootPath, "Logs");
        if (!Directory.Exists(logDir))
        {
            Directory.CreateDirectory(logDir);
        }

        var logFilePath = Path.Combine(logDir, $"Order_{order.Id}_Email.txt");
        await System.IO.File.WriteAllTextAsync(logFilePath, $"TO: {toEmail}\nSUBJECT: {subject}\n\n{content}");

        // Also write to a shared project-level emails log so user can see it easily
        var sharedEmailLog = Path.Combine(_env.ContentRootPath, "..", "sent_emails.log");
        var logEntry = $"=== EMAIL SENT AT {DateTime.Now} ===\nTO: {toEmail}\nSUBJECT: {subject}\nCONTENT:\n{content}\n=====================================\n\n";
        await System.IO.File.AppendAllTextAsync(sharedEmailLog, logEntry);

        Console.WriteLine($"[EMAIL SIMULATION] Sent order confirmation email to {toEmail} for Order ID {order.Id}");
    }
}

public class PlaceOrderDto
{
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Online
    public bool IsFromCart { get; set; }
    public DirectItemDto? DirectItem { get; set; }
}

public class DirectItemDto
{
    public int ItemId { get; set; }
    public int Quantity { get; set; } = 1;
}
public class OrderItemDto
{
    public int ItemId { get; set; }
    public int Quantity { get; set; }
}
