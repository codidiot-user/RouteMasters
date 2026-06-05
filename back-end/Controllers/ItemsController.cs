using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Api.Data;
using RetailOrdering.Api.Models;

namespace RetailOrdering.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ItemsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetItems([FromQuery] string? category)
    {
        IQueryable<Item> query = _context.Items;

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(i => i.Category.ToLower() == category.ToLower());
        }

        return await query.ToListAsync();
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<Item>>> SearchItems([FromQuery] string query, [FromQuery] string? category)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            IQueryable<Item> fallbackQuery = _context.Items;
            if (!string.IsNullOrEmpty(category))
            {
                fallbackQuery = fallbackQuery.Where(i => i.Category.ToLower() == category.ToLower());
            }
            return await fallbackQuery.ToListAsync();
        }

        var normalizedQuery = query.ToLower();
        IQueryable<Item> dbQuery = _context.Items.Where(i => 
            i.Name.ToLower().Contains(normalizedQuery) || 
            i.Description.ToLower().Contains(normalizedQuery)
        );

        if (!string.IsNullOrEmpty(category))
        {
            dbQuery = dbQuery.Where(i => i.Category.ToLower() == category.ToLower());
        }

        return await dbQuery.ToListAsync();
    }
}
