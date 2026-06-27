using RentHub.Application.Common;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;
using RentHub.Domain.Entities;
using RentHub.Domain.Enums;

namespace RentHub.Application.Owner;

public class OwnerService
{
    private readonly IPropertyRepository _properties;
    private readonly IBookingRepository _bookings;
    private readonly IExcelExporter _exporter;
    private readonly INotificationService _notifications;

    public OwnerService(
        IPropertyRepository properties,
        IBookingRepository bookings,
        IExcelExporter exporter,
        INotificationService notifications)
    {
        _properties = properties;
        _bookings = bookings;
        _exporter = exporter;
        _notifications = notifications;
    }

    public async Task<IReadOnlyList<OwnerPropertyDto>> GetDashboardAsync(Guid ownerId, CancellationToken ct = default)
    {
        var properties = await _properties.GetByOwnerAsync(ownerId, ct);
        var result = new List<OwnerPropertyDto>();

        foreach (var p in properties)
        {
            var confirmed = p.Bookings
                .Where(b => b.Status is BookingStatus.Confirmed or BookingStatus.Completed)
                .ToList();

            var nightsBooked = confirmed.Sum(b => b.Range.Nights);
            var revenue = confirmed.Sum(b => b.Total);
            var occupancy = nightsBooked == 0 ? 0 : Math.Min(1.0, nightsBooked / 30.0);

            result.Add(new OwnerPropertyDto(
                p.Id, p.Title, p.City, p.Country, p.PricePerNight, p.Rating, p.Reviews,
                p.Beds, p.Baths, p.MaxGuests,
                p.Images.OrderBy(i => i.Position).Select(i => i.Url).ToList(),
                p.Owner?.FullName ?? string.Empty,
                confirmed.Select(b => new DateRangeDto(b.CheckInDate, b.CheckOutDate)).ToList(),
                p.Tags.Select(t => t.Label).ToList(),
                Math.Round(occupancy, 2),
                revenue,
                nightsBooked));
        }

        return result;
    }

    public async Task<PropertyDto> PublishAsync(Guid ownerId, CreatePropertyRequest request, CancellationToken ct = default)
    {
        var property = new Property(
            ownerId, request.Title, request.City, request.Country,
            request.PricePerNight, request.Beds, request.Baths, request.MaxGuests);

        var position = 0;
        foreach (var url in request.Images)
            property.Images.Add(new PropertyImage(property.Id, url, position++));

        foreach (var tag in request.Tags)
            property.Tags.Add(new PropertyTag(property.Id, tag));

        await _properties.AddAsync(property, ct);

        await _notifications.NotifyAsync(
            ownerId,
            "Inmueble publicado",
            $"Tu inmueble \"{request.Title}\" fue publicado y ya está visible en el catálogo.",
            ct);

        return property.ToDto();
    }

    public async Task<byte[]> ExportReportAsync(Guid ownerId, Guid? propertyId, CancellationToken ct = default)
    {
        var rows = await _bookings.GetReportRowsAsync(ownerId, propertyId, ct);
        return _exporter.ExportBookings(rows);
    }
}
