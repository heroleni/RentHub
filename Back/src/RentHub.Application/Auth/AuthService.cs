using RentHub.Application.Common;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;
using RentHub.Domain.Entities;
using RentHub.Domain.Enums;

namespace RentHub.Application.Auth;

public class AuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokens;
    private readonly INotificationService _notifications;

    public AuthService(
        IUserRepository users,
        IPasswordHasher hasher,
        ITokenService tokens,
        INotificationService notifications)
    {
        _users = users;
        _hasher = hasher;
        _tokens = tokens;
        _notifications = notifications;
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var existing = await _users.GetByEmailAsync(request.Email, ct);
        if (existing is not null)
            throw new ConflictException("An account with this email already exists.");

        var role = request.Role.Equals("owner", StringComparison.OrdinalIgnoreCase)
            ? Role.Owner
            : Role.Guest;

        var user = new User(request.Email, _hasher.Hash(request.Password), request.FullName, role);
        await _users.AddAsync(user, ct);

        // Correo de bienvenida (se envía vía SMTP si está habilitado).
        await _notifications.NotifyAsync(
            user.Id,
            "Bienvenido a RentHub",
            $"Hola {user.FullName}, tu cuenta en RentHub fue creada con éxito. ¡Ya puedes explorar y reservar!",
            ct);

        return Build(user);
    }

    public async Task<AuthResultDto> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByEmailAsync(request.Email, ct)
            ?? throw new UnauthorizedException("Invalid credentials.");

        if (!_hasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        return Build(user);
    }

    private AuthResultDto Build(User user) => new(
        _tokens.CreateToken(user),
        user.Email,
        user.FullName,
        user.Role.ToString().ToLowerInvariant(),
        user.KycStatus.ToString().ToLowerInvariant());
}
