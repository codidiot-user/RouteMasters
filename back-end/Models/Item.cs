using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RetailOrdering.Api.Models;

public class Item
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Required]
    public string Category { get; set; } = string.Empty; // Food, Snacks, Cool Drinks, Combo Offers

    public string ImageUrl { get; set; } = string.Empty;
}
