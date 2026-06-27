using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using RentHub.Application.Common.Interfaces;
using RentHub.Domain.Entities;

namespace RentHub.Infrastructure.Security;

public class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}

public class JwtOptions
{
    public string Key { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public int ExpiryMinutes { get; set; } = 1440;
}

public class TokenService : ITokenService
{
    private readonly JwtOptions _options;

    public TokenService(JwtOptions options) => _options = options;

    public string CreateToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("name", user.FullName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.ExpiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class CurrentUser : ICurrentUser
{
    private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _accessor;

    public CurrentUser(Microsoft.AspNetCore.Http.IHttpContextAccessor accessor) => _accessor = accessor;

    public Guid? UserId
    {
        get
        {
            var value = _accessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? _accessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }
}
