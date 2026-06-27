using Microsoft.EntityFrameworkCore;
using RentHub.Application.Admin;
using RentHub.Application.Common.Dtos;
using RentHub.Domain.Enums;

namespace RentHub.Infrastructure.Persistence;

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _db;
    public AdminRepository(AppDbContext db) => _db = db;

    public async Task<AdminStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var totalProperties = await _db.Properties.CountAsync(ct);
        var totalUsers = await _db.Users.CountAsync(ct);

        var activeStatuses = new[] { BookingStatus.Confirmed, BookingStatus.Completed };

        var totalRevenue = await _db.Bookings
            .Where(b => activeStatuses.Contains(b.Status))
            .SumAsync(b => (decimal?)b.Total, ct) ?? 0m;

        var activeBookings = await _db.Bookings
            .CountAsync(b => b.Status == BookingStatus.Confirmed, ct);

        var kycApproved = await _db.Users.CountAsync(u => u.KycStatus == KycStatus.Approved, ct);
        var kycPending = await _db.Users.CountAsync(
            u => u.KycStatus == KycStatus.Processing || u.KycStatus == KycStatus.Unstarted, ct);

        return new AdminStatsDto(
            totalProperties,
            totalUsers,
            totalRevenue,
            activeBookings,
            kycApproved,
            kycPending);
    }

    public async Task<IReadOnlyList<AdminPropertyDto>> GetAllPropertiesAsync(CancellationToken ct = default)
    {
        var properties = await _db.Properties
            .Include(p => p.Owner)
            .Include(p => p.Images)
            .Include(p => p.Tags)
            .Include(p => p.Bookings)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        var result = new List<AdminPropertyDto>();
        foreach (var p in properties)
        {
            var confirmed = p.Bookings
                .Where(b => b.Status is BookingStatus.Confirmed or BookingStatus.Completed)
                .ToList();

            var nightsBooked = confirmed.Sum(b => b.Range.Nights);
            var revenue = confirmed.Sum(b => b.Total);
            var occupancy = nightsBooked == 0 ? 0 : Math.Min(1.0, nightsBooked / 30.0);

            result.Add(new AdminPropertyDto(
                p.Id, p.Title, p.City, p.Country, p.PricePerNight, p.Rating, p.Reviews,
                p.Beds, p.Baths, p.MaxGuests,
                p.Images.OrderBy(i => i.Position).Select(i => i.Url).ToList(),
                p.Owner?.FullName ?? string.Empty,
                confirmed.Select(b => new DateRangeDto(b.CheckInDate, b.CheckOutDate)).ToList(),
                p.Tags.Select(t => t.Label).ToList(),
                Math.Round(occupancy, 2),
                revenue,
                nightsBooked,
                IsActive: true));
        }

        return result;
    }
}
