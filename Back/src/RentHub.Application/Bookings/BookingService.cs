using RentHub.Application.Common;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;
using RentHub.Domain.Entities;
using RentHub.Domain.ValueObjects;

namespace RentHub.Application.Bookings;

public class BookingService
{
    private const decimal ServiceFeeRate = 0.08m;

    private readonly IBookingRepository _bookings;
    private readonly IPropertyRepository _properties;
    private readonly IUserRepository _users;
    private readonly INotificationService _notifications;

    public BookingService(
        IBookingRepository bookings,
        IPropertyRepository properties,
        IUserRepository users,
        INotificationService notifications)
    {
        _bookings = bookings;
        _properties = properties;
        _users = users;
        _notifications = notifications;
    }

    public async Task<BookingDto> CreateAsync(Guid userId, CreateBookingRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("User not found.");

        var property = await _properties.GetByIdAsync(request.PropertyId, ct)
            ?? throw new NotFoundException("Property not found.");

        var range = new DateRange(request.From, request.To);

        if (request.Guests > property.MaxGuests)
            throw new AppException("The number of guests exceeds the property capacity.");

        if (!user.IsIdentityVerified && !user.HasBookings)
            throw new ConflictException("You must complete identity verification before your first booking.");

        var overlaps = await _bookings.HasOverlapAsync(property.Id, range.From, range.To, ct);
        if (overlaps)
            throw new ConflictException("The selected dates are no longer available for this property.");

        var booking = Booking.Create(property.Id, userId, range, request.Guests, property.PricePerNight, ServiceFeeRate);

        await _bookings.AddAsync(booking, ct);

        await _notifications.NotifyAsync(
            userId,
            "Reserva confirmada",
            $"¡Tu reserva en {property.Title} fue confirmada! Llegada el {range.From:dd/MM/yyyy} a las 14:00 y salida el {range.To:dd/MM/yyyy} a las 12:00.",
            ct);

        var created = await _properties.GetByIdAsync(property.Id, ct);

        return new BookingDto(
            booking.Id,
            property.Id,
            property.Title,
            property.City,
            created?.Images.OrderBy(i => i.Position).Select(i => i.Url).FirstOrDefault() ?? string.Empty,
            booking.CheckInDate,
            booking.CheckOutDate,
            booking.Guests,
            booking.Total,
            booking.Status.ToString().ToLowerInvariant());
    }

    public async Task<IReadOnlyList<BookingDto>> GetMineAsync(Guid userId, CancellationToken ct = default)
    {
        var result = await _bookings.GetByUserAsync(userId, ct);
        return result.Select(b => b.ToDto()).ToList();
    }
}
