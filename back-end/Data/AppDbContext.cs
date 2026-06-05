using Microsoft.EntityFrameworkCore;
using RetailOrdering.Api.Models;

namespace RetailOrdering.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure relationships
        builder.Entity<CartItem>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CartItem>()
            .HasOne(c => c.Item)
            .WithMany()
            .HasForeignKey(c => c.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<OrderItem>()
            .HasOne(oi => oi.Item)
            .WithMany()
            .HasForeignKey(oi => oi.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed data
        builder.Entity<Item>().HasData(
            // Food
            new Item { Id = 1, Name = "Premium Cheeseburger", Description = "Juicy flame-grilled beef patty, melted cheddar, lettuce, tomato, and chef's special sauce.", Price = 5.99m, Category = "Food", ImageUrl = "assets/food_burger.jpg" },
            new Item { Id = 2, Name = "Margherita Pizza", Description = "Fresh mozzarella, classic tomato sauce, and fresh basil on a hand-stretched sourdough crust.", Price = 8.49m, Category = "Food", ImageUrl = "assets/food_pizza.jpg" },
            new Item { Id = 3, Name = "Chicken Biryani", Description = "Fragrant basmati rice cooked with succulent spiced chicken and exotic herbs.", Price = 9.99m, Category = "Food", ImageUrl = "assets/food_biryani.jpg" },
            new Item { Id = 4, Name = "Club Sandwich", Description = "Triple-decker bread with grilled chicken breast, smoked bacon, egg, lettuce, and mayo.", Price = 4.99m, Category = "Food", ImageUrl = "assets/food_sandwich.jpg" },
            new Item { Id = 5, Name = "Hakka Noodles", Description = "Stir-fried wheat noodles with crisp julienned vegetables and authentic Asian spices.", Price = 6.49m, Category = "Food", ImageUrl = "assets/food_noodles.jpg" },

            // Snacks
            new Item { Id = 6, Name = "Kettle Potato Chips", Description = "Thick, crunchy potato chips seasoned with hand-harvested sea salt.", Price = 1.99m, Category = "Snacks", ImageUrl = "assets/snacks_chips.jpg" },
            new Item { Id = 7, Name = "Crispy French Fries", Description = "Golden, perfectly salted potato fries served hot with ketchup.", Price = 2.49m, Category = "Snacks", ImageUrl = "assets/snacks_fries.jpg" },
            new Item { Id = 8, Name = "Spicy Vegetable Samosa", Description = "Flaky pastry triangles filled with seasoned spiced potatoes and green peas.", Price = 1.49m, Category = "Snacks", ImageUrl = "assets/snacks_samosa.jpg" },
            new Item { Id = 9, Name = "Butter Popcorn", Description = "Freshly popped corn kernels tossed in warm, aromatic melted butter.", Price = 2.99m, Category = "Snacks", ImageUrl = "assets/snacks_popcorn.jpg" },
            new Item { Id = 10, Name = "Loaded Nachos", Description = "Crispy corn tortillas topped with warm cheese sauce, jalapenos, and salsa.", Price = 3.99m, Category = "Snacks", ImageUrl = "assets/snacks_nachos.jpg" },

            // Cool Drinks
            new Item { Id = 11, Name = "Classic Coca Cola", Description = "Chilled 330ml can of the original refreshing cola.", Price = 1.49m, Category = "Cool Drinks", ImageUrl = "assets/drinks_coke.jpg" },
            new Item { Id = 12, Name = "Chilled Pepsi", Description = "Cold 330ml can of Pepsi to quench your thirst.", Price = 1.49m, Category = "Cool Drinks", ImageUrl = "assets/drinks_pepsi.jpg" },
            new Item { Id = 13, Name = "Fresh Orange Juice", Description = "100% natural freshly squeezed orange juice rich in Vitamin C.", Price = 2.99m, Category = "Cool Drinks", ImageUrl = "assets/drinks_orange.jpg" },
            new Item { Id = 14, Name = "Home Lemonade", Description = "Refreshing classic lemonade made with fresh lemons, mint, and honey.", Price = 2.49m, Category = "Cool Drinks", ImageUrl = "assets/drinks_lemonade.jpg" },
            new Item { Id = 15, Name = "Peach Iced Tea", Description = "Brewed black tea infused with natural sweet peach flavors and ice.", Price = 2.29m, Category = "Cool Drinks", ImageUrl = "assets/drinks_icedtea.jpg" },

            // Combo Offers
            new Item { Id = 16, Name = "Classic Burger Combo", Description = "Cheeseburger + French Fries + Coke. The ultimate meal deal.", Price = 8.99m, Category = "Combo Offers", ImageUrl = "assets/combo_burger.jpg" },
            new Item { Id = 17, Name = "Pizza Party Feast", Description = "Margherita Pizza + Garlic Bread + Peach Iced Tea. Perfect for sharing.", Price = 11.99m, Category = "Combo Offers", ImageUrl = "assets/combo_pizza.jpg" },
            new Item { Id = 18, Name = "Movie Night Special", Description = "Butter Popcorn + Kettle Chips + 2 Cokes. Fun times guaranteed.", Price = 6.99m, Category = "Combo Offers", ImageUrl = "assets/combo_movie.jpg" },
            new Item { Id = 19, Name = "Mega Double Deal", Description = "2 Cheeseburgers + 2 Fries + 2 Lemonades. Best value for two.", Price = 15.99m, Category = "Combo Offers", ImageUrl = "assets/combo_double.jpg" }
        );
    }
}
