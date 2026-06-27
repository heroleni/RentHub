using RentHub.Application.Common;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;
using RentHub.Application.Owner;

namespace RentHub.Api.Endpoints;

public static class OwnerEndpoints
{
    private const string XlsxContentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    public static void MapOwnerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/owner").WithTags("Owner").RequireAuthorization("OwnerOnly");

        group.MapGet("/properties", async (OwnerService service, ICurrentUser current, CancellationToken ct) =>
        {
            var ownerId = current.UserId ?? throw new UnauthorizedException("Authentication required.");
            var result = await service.GetDashboardAsync(ownerId, ct);
            return Results.Ok(result);
        });

        group.MapPost("/properties", async (
            CreatePropertyRequest request,
            OwnerService service,
            ICurrentUser current,
            CancellationToken ct) =>
        {
            var ownerId = current.UserId ?? throw new UnauthorizedException("Authentication required.");
            var result = await service.PublishAsync(ownerId, request, ct);
            return Results.Created($"/api/properties/{result.Id}", result);
        });

        group.MapGet("/reports/export", async (
            Guid? propertyId,
            OwnerService service,
            ICurrentUser current,
            CancellationToken ct) =>
        {
            var ownerId = current.UserId ?? throw new UnauthorizedException("Authentication required.");
            var bytes = await service.ExportReportAsync(ownerId, propertyId, ct);
            var fileName = $"reporte-renthub-{DateTime.UtcNow:yyyyMMdd}.xlsx";
            return Results.File(bytes, XlsxContentType, fileName);
        });
    }
}
