using RentHub.Application.Common;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;
using RentHub.Domain.Entities;

namespace RentHub.Application.Properties;

public class FavoriteService
{
    private readonly IFavoriteRepository _favorites;
    private readonly INotificationService _notifications;

    public FavoriteService(IFavoriteRepository favorites, INotificationService notifications)
    {
        _favorites = favorites;
        _notifications = notifications;
    }

    public async Task<IReadOnlyList<PropertyDto>> GetMineAsync(Guid userId, CancellationToken ct = default)
    {
        var result = await _favorites.GetPropertiesAsync(userId, ct);
        return result.Select(p => p.ToDto()).ToList();
    }

    public async Task AddAsync(Guid userId, Guid propertyId, CancellationToken ct = default)
    {
        if (await _favorites.ExistsAsync(userId, propertyId, ct))
            return;

        await _favorites.AddAsync(new Favorite(userId, propertyId), ct);

        await _notifications.NotifyAsync(
            userId,
            "Guardado en favoritos",
            "Guardamos esta propiedad en tu lista de favoritos.",
            ct);
    }

    public async Task RemoveAsync(Guid userId, Guid propertyId, CancellationToken ct = default)
    {
        await _favorites.RemoveAsync(userId, propertyId, ct);
    }
}
