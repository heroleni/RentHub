using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;

namespace RentHub.Application.Admin;

/// <summary>
/// Acceso de solo lectura a métricas globales de la plataforma.
/// Implementado en Infrastructure con consultas agregadas sobre el DbContext.
/// </summary>
public interface IAdminRepository
{
    Task<AdminStatsDto> GetStatsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AdminPropertyDto>> GetAllPropertiesAsync(CancellationToken ct = default);
}

public class AdminService
{
    private readonly IAdminRepository _repo;
    private readonly IExcelExporter _exporter;

    public AdminService(IAdminRepository repo, IExcelExporter exporter)
    {
        _repo = repo;
        _exporter = exporter;
    }

    public Task<AdminStatsDto> GetStatsAsync(CancellationToken ct = default) =>
        _repo.GetStatsAsync(ct);

    public Task<IReadOnlyList<AdminPropertyDto>> GetAllPropertiesAsync(CancellationToken ct = default) =>
        _repo.GetAllPropertiesAsync(ct);

    /// <summary>Genera un reporte Excel (.xlsx) con todos los inmuebles de la plataforma.</summary>
    public async Task<byte[]> ExportPropertiesReportAsync(CancellationToken ct = default)
    {
        var properties = await _repo.GetAllPropertiesAsync(ct);
        return _exporter.ExportProperties(properties);
    }
}
