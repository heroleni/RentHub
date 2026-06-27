using RentHub.Domain.Enums;
using RentHub.Domain.ValueObjects;

namespace RentHub.Domain.Entities;

public class Booking
{
    public static readonly TimeOnly StandardCheckIn = new(14, 0);
    public static readonly TimeOnly StandardCheckOut = new(12, 0);

    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid PropertyId { get; private set; }
    public Guid UserId { get; private set; }
    public DateOnly CheckInDate { get; private set; }
    public DateOnly CheckOutDate { get; private set; }
    public TimeOnly CheckInTime { get; private set; }
    public TimeOnly CheckOutTime { get; private set; }
    public int Guests { get; private set; }
    public decimal Total { get; private set; }
    public BookingStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public Property Property { get; private set; } = null!;
    public User User { get; private set; } = null!;

    private Booking() { }

    public static Booking Create(
        Guid propertyId,
        Guid userId,
        DateRange range,
        int guests,
        decimal pricePerNight,
        decimal serviceFeeRate)
    {
        var subtotal = pricePerNight * range.Nights;
        var serviceFee = Math.Round(subtotal * serviceFeeRate, 0);

        return new Booking
        {
            PropertyId = propertyId,
            UserId = userId,
            CheckInDate = range.From,
            CheckOutDate = range.To,
            CheckInTime = StandardCheckIn,
            CheckOutTime = StandardCheckOut,
            Guests = guests,
            Total = subtotal + serviceFee,
            Status = BookingStatus.Confirmed
        };
    }

    public DateRange Range => new(CheckInDate, CheckOutDate);

    public void Cancel() => Status = BookingStatus.Cancelled;

    public void Complete() => Status = BookingStatus.Completed;
}
