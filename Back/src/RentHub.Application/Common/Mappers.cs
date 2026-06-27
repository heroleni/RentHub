using RentHub.Application.Common.Dtos;
using RentHub.Domain.Entities;

namespace RentHub.Application.Common;

public static class Mappers
{
    public static PropertyDto ToDto(this Property p) => new(
        p.Id,
        p.Title,
        p.City,
        p.Country,
        p.PricePerNight,
        p.Rating,
        p.Reviews,
        p.Beds,
        p.Baths,
        p.MaxGuests,
        p.Images.OrderBy(i => i.Position).Select(i => i.Url).ToList(),
        p.Owner?.FullName ?? string.Empty,
        p.Bookings
            .Where(b => b.Status != Domain.Enums.BookingStatus.Cancelled)
            .Select(b => new DateRangeDto(b.CheckInDate, b.CheckOutDate))
            .ToList(),
        p.Tags.Select(t => t.Label).ToList());

    public static BookingDto ToDto(this Booking b) => new(
        b.Id,
        b.PropertyId,
        b.Property?.Title ?? string.Empty,
        b.Property?.City ?? string.Empty,
        b.Property?.Images.OrderBy(i => i.Position).Select(i => i.Url).FirstOrDefault() ?? string.Empty,
        b.CheckInDate,
        b.CheckOutDate,
        b.Guests,
        b.Total,
        b.Status.ToString().ToLowerInvariant());
}
