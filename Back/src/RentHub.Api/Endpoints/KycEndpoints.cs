using RentHub.Application.Common;
using RentHub.Application.Common.Interfaces;
using RentHub.Application.Kyc;

namespace RentHub.Api.Endpoints;

public static class KycEndpoints
{
    public static void MapKycEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/kyc").WithTags("Kyc").RequireAuthorization();

        group.MapPost("/", async (
            IFormFile front,
            IFormFile back,
            KycService service,
            ICurrentUser current,
            CancellationToken ct) =>
        {
            var userId = current.UserId ?? throw new UnauthorizedException("Authentication required.");

            await using var frontStream = front.OpenReadStream();
            await using var backStream = back.OpenReadStream();

            var result = await service.SubmitAsync(userId, frontStream, backStream, ct);
            return Results.Ok(result);
        })
        .DisableAntiforgery();
    }
}
