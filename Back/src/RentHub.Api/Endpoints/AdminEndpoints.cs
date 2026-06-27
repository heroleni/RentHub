using RentHub.Application.Admin;

namespace RentHub.Api.Endpoints;

public static class AdminEndpoints
{
    private const string XlsxContentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    public static void MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin").WithTags("Admin").RequireAuthorization("AdminOnly");

        group.MapGet("/stats", async (AdminService service, CancellationToken ct) =>
        {
            var result = await service.GetStatsAsync(ct);
            return Results.Ok(result);
        });

        group.MapGet("/properties", async (AdminService service, CancellationToken ct) =>
        {
            var result = await service.GetAllPropertiesAsync(ct);
            return Results.Ok(result);
        });

        group.MapGet("/reports/export", async (AdminService service, CancellationToken ct) =>
        {
            var bytes = await service.ExportPropertiesReportAsync(ct);
            var fileName = $"inmuebles-renthub-{DateTime.UtcNow:yyyyMMdd}.xlsx";
            return Results.File(bytes, XlsxContentType, fileName);
        });
    }
}
