using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RetailOrdering.Api.Models;

public class Order
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    public User? User { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Required]
    public string Status { get; set; } = "Pending"; // Pending, Completed, Cancelled

    [Required]
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Online

    public List<OrderItem> OrderItems { get; set; } = new();
}
