using Microsoft.EntityFrameworkCore;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;
using RentHub.Domain.Entities;
using RentHub.Domain.Enums;

namespace RentHub.Infrastructure.Persistence;

public class PropertyRepository : IPropertyRepository
{
    private readonly AppDbContext _db;
    public PropertyRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<Property>> SearchAsync(PropertySearchQuery query, CancellationToken ct = default)
    {
        var q = _db.Properties
            .Include(p => p.Owner)
            .Include(p => p.Images)
            .Include(p => p.Tags)
            .Include(p => p.Bookings)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.City))
        {
            var city = query.City.Trim().ToLower();
            q = q.Where(p => p.City.ToLower().Contains(city) || p.Country.ToLower().Contains(city));
        }

        if (query.From is { } from && query.To is { } to)
        {
            q = q.Where(p => !p.Bookings.Any(b =>
                b.Status != BookingStatus.Cancelled &&
                b.CheckInDate < to && from < b.CheckOutDate));
        }

        return await q.OrderByDescending(p => p.Rating).ToListAsync(ct);
    }

    public async Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.Properties
            .Include(p => p.Owner)
            .Include(p => p.Images)
            .Include(p => p.Tags)
            .Include(p => p.Bookings)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default) =>
        await _db.Properties
            .Include(p => p.Owner)
            .Include(p => p.Images)
            .Include(p => p.Tags)
            .Include(p => p.Bookings)
            .Where(p => p.OwnerId == ownerId)
            .ToListAsync(ct);

    public async Task AddAsync(Property property, CancellationToken ct = default)
    {
        await _db.Properties.AddAsync(property, ct);
        await _db.SaveChangesAsync(ct);
    }
}

public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _db;
    public BookingRepository(AppDbContext db) => _db = db;

    public async Task<bool> HasOverlapAsync(Guid propertyId, DateOnly from, DateOnly to, CancellationToken ct = default) =>
        await _db.Bookings.AnyAsync(b =>
            b.PropertyId == propertyId &&
            b.Status != BookingStatus.Cancelled &&
            b.CheckInDate < to && from < b.CheckOutDate, ct);

    public async Task<IReadOnlyList<Booking>> GetByUserAsync(Guid userId, CancellationToken ct = default) =>
        await _db.Bookings
            .Include(b => b.Property).ThenInclude(p => p.Images)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CheckInDate)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<BookingReportRow>> GetReportRowsAsync(Guid ownerId, Guid? propertyId, CancellationToken ct = default)
    {
        var q = _db.Bookings
            .Include(b => b.Property)
            .Include(b => b.User)
            .Where(b => b.Property.OwnerId == ownerId && b.Status != BookingStatus.Cancelled);

        if (propertyId is { } id)
            q = q.Where(b => b.PropertyId == id);

        return await q
            .OrderByDescending(b => b.CheckInDate)
            .Select(b => new BookingReportRow(
                b.Property.Title,
                b.User.FullName,
                b.CheckInDate,
                b.CheckOutDate,
                b.Total))
            .ToListAsync(ct);
    }

    public async Task AddAsync(Booking booking, CancellationToken ct = default)
    {
        await _db.Bookings.AddAsync(booking, ct);
        await _db.SaveChangesAsync(ct);
    }
}

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;
    public UserRepository(AppDbContext db) => _db = db;

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.Users.Include(u => u.Bookings).FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await _db.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLower(), ct);

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        await _db.Users.AddAsync(user, ct);
        await _db.SaveChangesAsync(ct);
    }
}

public class FavoriteRepository : IFavoriteRepository
{
    private readonly AppDbContext _db;
    public FavoriteRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<Property>> GetPropertiesAsync(Guid userId, CancellationToken ct = default) =>
        await _db.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.Property).ThenInclude(p => p.Owner)
            .Include(f => f.Property).ThenInclude(p => p.Images)
            .Include(f => f.Property).ThenInclude(p => p.Tags)
            .Include(f => f.Property).ThenInclude(p => p.Bookings)
            .Select(f => f.Property)
            .ToListAsync(ct);

    public async Task<bool> ExistsAsync(Guid userId, Guid propertyId, CancellationToken ct = default) =>
        await _db.Favorites.AnyAsync(f => f.UserId == userId && f.PropertyId == propertyId, ct);

    public async Task AddAsync(Favorite favorite, CancellationToken ct = default)
    {
        await _db.Favorites.AddAsync(favorite, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task RemoveAsync(Guid userId, Guid propertyId, CancellationToken ct = default)
    {
        var favorite = await _db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.PropertyId == propertyId, ct);
        if (favorite is not null)
        {
            _db.Favorites.Remove(favorite);
            await _db.SaveChangesAsync(ct);
        }
    }
}

public class KycRepository : IKycRepository
{
    private readonly AppDbContext _db;
    public KycRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(KycVerification verification, CancellationToken ct = default)
    {
        await _db.KycVerifications.AddAsync(verification, ct);
        await _db.SaveChangesAsync(ct);
    }
}
