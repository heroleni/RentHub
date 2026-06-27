using RentHub.Application.Auth;
using RentHub.Application.Common.Dtos;

namespace RentHub.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterRequest request, AuthService service, CancellationToken ct) =>
        {
            var result = await service.RegisterAsync(request, ct);
            return Results.Ok(result);
        });

        group.MapPost("/login", async (LoginRequest request, AuthService service, CancellationToken ct) =>
        {
            var result = await service.LoginAsync(request, ct);
            return Results.Ok(result);
        });
    }
}
