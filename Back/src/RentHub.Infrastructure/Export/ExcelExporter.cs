using ClosedXML.Excel;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;

namespace RentHub.Infrastructure.Export;

public class ExcelExporter : IExcelExporter
{
    public byte[] ExportBookings(IEnumerable<BookingReportRow> rows)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Reservas");

        sheet.Cell(1, 1).Value = "Inmueble";
        sheet.Cell(1, 2).Value = "Huésped";
        sheet.Cell(1, 3).Value = "Check-in";
        sheet.Cell(1, 4).Value = "Check-out";
        sheet.Cell(1, 5).Value = "Precio pagado";

        var header = sheet.Range(1, 1, 1, 5);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromHtml("#1E8A5C");
        header.Style.Font.FontColor = XLColor.White;

        var row = 2;
        foreach (var item in rows)
        {
            sheet.Cell(row, 1).Value = item.PropertyTitle;
            sheet.Cell(row, 2).Value = item.GuestName;
            sheet.Cell(row, 3).Value = item.CheckIn.ToDateTime(new TimeOnly(14, 0));
            sheet.Cell(row, 4).Value = item.CheckOut.ToDateTime(new TimeOnly(12, 0));
            sheet.Cell(row, 5).Value = item.Total;

            sheet.Cell(row, 3).Style.DateFormat.Format = "dd/MM/yyyy";
            sheet.Cell(row, 4).Style.DateFormat.Format = "dd/MM/yyyy";
            sheet.Cell(row, 5).Style.NumberFormat.Format = "$#,##0";
            row++;
        }

        sheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] ExportProperties(IEnumerable<AdminPropertyDto> properties)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Inmuebles");

        sheet.Cell(1, 1).Value = "Inmueble";
        sheet.Cell(1, 2).Value = "Ciudad";
        sheet.Cell(1, 3).Value = "Anfitrión";
        sheet.Cell(1, 4).Value = "Precio/noche";
        sheet.Cell(1, 5).Value = "Calificación";
        sheet.Cell(1, 6).Value = "Noches reservadas";
        sheet.Cell(1, 7).Value = "Ocupación";
        sheet.Cell(1, 8).Value = "Ingresos";

        var header = sheet.Range(1, 1, 1, 8);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromHtml("#1E8A5C");
        header.Style.Font.FontColor = XLColor.White;

        var row = 2;
        foreach (var p in properties)
        {
            sheet.Cell(row, 1).Value = p.Title;
            sheet.Cell(row, 2).Value = p.City;
            sheet.Cell(row, 3).Value = p.HostName;
            sheet.Cell(row, 4).Value = p.PricePerNight;
            sheet.Cell(row, 5).Value = p.Rating;
            sheet.Cell(row, 6).Value = p.NightsBooked;
            sheet.Cell(row, 7).Value = p.OccupancyRate;
            sheet.Cell(row, 8).Value = p.MonthlyRevenue;

            sheet.Cell(row, 4).Style.NumberFormat.Format = "$#,##0";
            sheet.Cell(row, 7).Style.NumberFormat.Format = "0%";
            sheet.Cell(row, 8).Style.NumberFormat.Format = "$#,##0";
            row++;
        }

        // Fila de totales
        if (row > 2)
        {
            sheet.Cell(row, 1).Value = "TOTAL";
            sheet.Cell(row, 6).FormulaA1 = $"SUM(F2:F{row - 1})";
            sheet.Cell(row, 8).FormulaA1 = $"SUM(H2:H{row - 1})";
            var totals = sheet.Range(row, 1, row, 8);
            totals.Style.Font.Bold = true;
            totals.Style.Border.TopBorder = XLBorderStyleValues.Thin;
            sheet.Cell(row, 8).Style.NumberFormat.Format = "$#,##0";
        }

        sheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
