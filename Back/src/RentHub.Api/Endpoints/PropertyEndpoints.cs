using RentHub.Application.Common.Dtos;
using RentHub.Application.Properties;

namespace RentHub.Api.Endpoints;

public static class PropertyEndpoints
{
    public static void MapPropertyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/properties").WithTags("Properties");

        group.MapGet("/", async (
            string? city,
            DateOnly? from,
            DateOnly? to,
            PropertyService service,
            CancellationToken ct) =>
        {
            var result = await service.SearchAsync(new PropertySearchQuery(city, from, to), ct);
            return Results.Ok(result);
        });

        group.MapGet("/{id:guid}", async (Guid id, PropertyService service, CancellationToken ct) =>
        {
            var result = await service.GetAsync(id, ct);
            return Results.Ok(result);
        });
    }
}
