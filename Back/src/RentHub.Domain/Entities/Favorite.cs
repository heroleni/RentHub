using RentHub.Domain.Enums;

namespace RentHub.Domain.Entities;

public class Favorite
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public Guid PropertyId { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public Property Property { get; private set; } = null!;

    private Favorite() { }

    public Favorite(Guid userId, Guid propertyId)
    {
        UserId = userId;
        PropertyId = propertyId;
    }
}

public class KycVerification
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public KycStatus Status { get; private set; }
    public string? Names { get; private set; }
    public string? LastNames { get; private set; }
    public string? DocumentNumber { get; private set; }
    public DateOnly? BirthDate { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private KycVerification() { }

    public static KycVerification Approved(
        Guid userId,
        string names,
        string lastNames,
        string documentNumber,
        DateOnly birthDate) => new()
    {
        UserId = userId,
        Status = KycStatus.Approved,
        Names = names,
        LastNames = lastNames,
        DocumentNumber = documentNumber,
        BirthDate = birthDate
    };

    public static KycVerification Rejected(Guid userId, string reason) => new()
    {
        UserId = userId,
        Status = KycStatus.Rejected,
        RejectionReason = reason
    };
}
