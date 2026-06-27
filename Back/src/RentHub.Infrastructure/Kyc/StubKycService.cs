using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;

namespace RentHub.Infrastructure.Kyc;

public class StubKycService : IKycService
{
    public async Task<KycResultDto> AnalyzeDocumentAsync(Stream frontImage, Stream backImage, CancellationToken ct = default)
    {
        await Task.Delay(1500, ct);

        var approved = Random.Shared.NextDouble() > 0.25;

        if (approved)
        {
            return new KycResultDto(
                "approved",
                "Camila Andrea",
                "Restrepo Gómez",
                "1.0",
                new DateOnly(1996, 3, 14),
                null);
        }

        return new KycResultDto(
            "rejected",
            null, null, null, null,
            "La foto del documento está borrosa o no coincide. Vuelve a intentarlo con buena luz.");
    }
}
