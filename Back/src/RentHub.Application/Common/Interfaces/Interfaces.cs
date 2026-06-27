using RentHub.Application.Common.Dtos;
using RentHub.Domain.Entities;

namespace RentHub.Application.Common.Interfaces;

public interface IAppDbContext
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public interface IPropertyRepository
{
    Task<IReadOnlyList<Property>> SearchAsync(PropertySearchQuery query, CancellationToken ct = default);
    Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default);
    Task AddAsync(Property property, CancellationToken ct = default);
}

public interface IBookingRepository
{
    Task<bool> HasOverlapAsync(Guid propertyId, DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<IReadOnlyList<Booking>> GetByUserAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<BookingReportRow>> GetReportRowsAsync(Guid ownerId, Guid? propertyId, CancellationToken ct = default);
    Task AddAsync(Booking booking, CancellationToken ct = default);
}

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
}

public interface IFavoriteRepository
{
    Task<IReadOnlyList<Property>> GetPropertiesAsync(Guid userId, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid userId, Guid propertyId, CancellationToken ct = default);
    Task AddAsync(Favorite favorite, CancellationToken ct = default);
    Task RemoveAsync(Guid userId, Guid propertyId, CancellationToken ct = default);
}

public interface IKycRepository
{
    Task AddAsync(KycVerification verification, CancellationToken ct = default);
}

public interface IKycService
{
    Task<KycResultDto> AnalyzeDocumentAsync(Stream frontImage, Stream backImage, CancellationToken ct = default);
}

public interface INotificationService
{
    Task NotifyAsync(Guid userId, string subject, string message, CancellationToken ct = default);
}

public interface IExcelExporter
{
    byte[] ExportBookings(IEnumerable<BookingReportRow> rows);
    byte[] ExportProperties(IEnumerable<AdminPropertyDto> properties);
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface ITokenService
{
    string CreateToken(User user);
}

public interface ICurrentUser
{
    Guid? UserId { get; }
}
