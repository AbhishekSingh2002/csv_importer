import { NextResponse } from "next/server";

const SAMPLE_CSV = `created_at,Client Name,Email,Mobile,Company,Status,Remarks,Lead Source,City,State
29-06-2026 10:00,Rahil Mohammad,rahil@test.com,+919579291234,Acme Corp,Good Lead,Interested in 3BHK,Meridian Tower,Bengaluru,Karnataka
29-06-2026 10:00,Tarvinder Pal,tarvinderpal@beauty.com,+919811362345,Beauty Co,Not Dialed,Call back tomorrow,Eden Park,Bengaluru,Karnataka
29-06-2026 10:00,Dhruv Bisht,,+919711564123,,Sale Done,Payment received,Sarjapur Plots,Bengaluru,Karnataka
29-06-2026 10:00,Amit Raheja,amit.raheja@example.com,,GrowEasy,Bad Lead,Not interested,Leads on Demand,Pune,Maharashtra
`;

export async function GET() {
  return new NextResponse(SAMPLE_CSV, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="groweasy-sample-leads.csv"',
    },
  });
}
