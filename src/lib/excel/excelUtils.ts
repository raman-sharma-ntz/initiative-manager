import ExcelJS from "exceljs";
import { Team, AppUser } from "../../types/models";

export const exportTeamsToExcel = async (teams: Team[], users: AppUser[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Teams");
  worksheet.columns = [
    { header: "Team Name", key: "teamName" },
    { header: "Lead", key: "lead" },
    { header: "Member Name", key: "memberName" },
    { header: "Member Email", key: "memberEmail" },
  ];

  teams.forEach(team => {
    const lead = users.find(u => u.id === team.leadId);
    team.memberIds.forEach(memberId => {
      const member = users.find(u => u.id === memberId);
      worksheet.addRow({
        teamName: team.name,
        lead: lead?.name,
        memberName: member?.name,
        memberEmail: member?.email,
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};