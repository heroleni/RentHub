using RentHub.Domain.Enums;

namespace RentHub.Domain.Entities;

public class User
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string FullName { get; private set; } = null!;
    public Role Role { get; private set; }
    public KycStatus KycStatus { get; private set; } = KycStatus.Unstarted;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<Booking> Bookings { get; private set; } = new List<Booking>();
    public ICollection<Favorite> Favorites { get; private set; } = new List<Favorite>();

    private User() { }

    public User(string email, string passwordHash, string fullName, Role role)
    {
        Email = email.Trim().ToLowerInvariant();
        PasswordHash = passwordHash;
        FullName = fullName;
        Role = role;
    }

    public void SetKycStatus(KycStatus status) => KycStatus = status;

    public bool IsIdentityVerified => KycStatus == KycStatus.Approved;

    public bool HasBookings => Bookings.Count > 0;
}
