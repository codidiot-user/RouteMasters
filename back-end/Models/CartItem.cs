using System.ComponentModel.DataAnnotations;

namespace RetailOrdering.Api.Models;

public class CartItem
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    public User? User { get; set; }

    [Required]
    public int ItemId { get; set; }
    public Item? Item { get; set; }

    [Required]
    public int Quantity { get; set; }
}
