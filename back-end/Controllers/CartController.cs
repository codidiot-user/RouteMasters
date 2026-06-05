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
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetCurrentUserId();
        var cartItems = await _context.CartItems
            .Include(c => c.Item)
            .Where(c => c.UserId == userId)
            .Select(c => new
            {
                c.Id,
                c.ItemId,
                c.Quantity,
                ItemName = c.Item != null ? c.Item.Name : string.Empty,
                Price = c.Item != null ? c.Item.Price : 0,
                Category = c.Item != null ? c.Item.Category : string.Empty,
                ImageUrl = c.Item != null ? c.Item.ImageUrl : string.Empty
            })
            .ToListAsync();

        return Ok(cartItems);
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var userId = GetCurrentUserId();
        var item = await _context.Items.FindAsync(dto.ItemId);
        if (item == null)
        {
            return NotFound(new { message = "Item not found." });
        }

        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ItemId == dto.ItemId);

        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
        }
        else
        {
            var cartItem = new CartItem
            {
                UserId = userId,
                ItemId = dto.ItemId,
                Quantity = dto.Quantity
            };
            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Item added to cart successfully." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFromCart(int id)
    {
        var userId = GetCurrentUserId();
        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (cartItem == null)
        {
            return NotFound(new { message = "Cart item not found." });
        }

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Item removed from cart successfully." });
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetCurrentUserId();
        var cartItems = await _context.CartItems
            .Where(c => c.UserId == userId)
            .ToListAsync();

        _context.CartItems.RemoveRange(cartItems);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cart cleared successfully." });
    }
}

public class AddToCartDto
{
    public int ItemId { get; set; }
    public int Quantity { get; set; } = 1;
}
