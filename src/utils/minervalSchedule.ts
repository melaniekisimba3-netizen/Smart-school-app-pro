import { Payment, Student } from "../types";

export interface SchoolMonthConfig {
  key: string;
  label: string;
  yearSuffix: string;
  defaultAmount: number;
  order: number;
}

export const ACADEMIC_MONTHS: SchoolMonthConfig[] = [
  { key: "septembre", label: "Septembre", yearSuffix: "2026", defaultAmount: 100, order: 1 },
  { key: "octobre", label: "Octobre", yearSuffix: "2026", defaultAmount: 100, order: 2 },
  { key: "novembre", label: "Novembre", yearSuffix: "2026", defaultAmount: 90, order: 3 },
  { key: "decembre", label: "Décembre", yearSuffix: "2026", defaultAmount: 100, order: 4 },
  { key: "janvier", label: "Janvier", yearSuffix: "2027", defaultAmount: 100, order: 5 },
  { key: "fevrier", label: "Février", yearSuffix: "2027", defaultAmount: 100, order: 6 },
  { key: "mars", label: "Mars", yearSuffix: "2027", defaultAmount: 100, order: 7 },
  { key: "avril", label: "Avril", yearSuffix: "2027", defaultAmount: 100, order: 8 },
  { key: "mai", label: "Mai", yearSuffix: "2027", defaultAmount: 100, order: 9 },
  { key: "juin", label: "Juin", yearSuffix: "2027", defaultAmount: 100, order: 10 },
];

export interface StudentMonthStatus {
  monthKey: string;
  monthLabel: string;
  yearSuffix: string;
  fullLabel: string; // e.g. "Septembre 2026"
  amount: number;
  status: "Payé" | "À payer" | "En retard" | "En attente";
  paidAt?: string;
  paymentRef?: string;
  paymentId?: string;
}

export interface StudentScheduleSummary {
  studentId: string;
  studentName: string;
  className: string;
  months: StudentMonthStatus[];
  totalExpectedUSD: number;
  annualFeeUSD: number;
  totalPaidUSD: number;
  remainingBalanceUSD: number;
  paidMonthsCount: number;
  unpaidMonthsCount: number;
  firstUnpaidMonth: StudentMonthStatus | null;
  isUpToDate: boolean;
  alertMessage?: string;
}

export function getStudentSchedule(
  studentId: string,
  studentName: string,
  className: string,
  payments: Payment[]
): StudentScheduleSummary {
  // Filter validated payments for this student
  const studentPayments = payments.filter(
    p => p.studentId === studentId && p.isValidated && (p.paymentType === "Minerval" || p.paymentType === "Écolage")
  );

  let totalPaidUSD = 0;
  let totalExpectedUSD = 0;

  const months: StudentMonthStatus[] = ACADEMIC_MONTHS.map((m) => {
    const fullLabel = `${m.label} ${m.yearSuffix}`;
    totalExpectedUSD += m.defaultAmount;

    // Check if there is a payment matching this month label or monthKey
    const matchedPayment = studentPayments.find(p => {
      if (p.paymentMonth) {
        return p.paymentMonth.toLowerCase().includes(m.label.toLowerCase()) || p.paymentMonth.toLowerCase().includes(m.key);
      }
      return false;
    });

    if (matchedPayment) {
      const amtUSD = matchedPayment.currency === "USD" ? matchedPayment.amount : matchedPayment.amount / 2800;
      totalPaidUSD += amtUSD;
      return {
        monthKey: m.key,
        monthLabel: m.label,
        yearSuffix: m.yearSuffix,
        fullLabel,
        amount: matchedPayment.amount,
        status: "Payé",
        paidAt: matchedPayment.createdAt,
        paymentRef: matchedPayment.reference,
        paymentId: matchedPayment.id
      };
    }

    return {
      monthKey: m.key,
      monthLabel: m.label,
      yearSuffix: m.yearSuffix,
      fullLabel,
      amount: m.defaultAmount,
      status: "En attente"
    };
  });

  // Calculate first unpaid month
  const firstUnpaidIndex = months.findIndex(m => m.status !== "Payé");
  let firstUnpaidMonth: StudentMonthStatus | null = null;

  if (firstUnpaidIndex !== -1) {
    months[firstUnpaidIndex].status = "À payer";
    firstUnpaidMonth = months[firstUnpaidIndex];

    for (let i = 0; i < firstUnpaidIndex; i++) {
      if (months[i].status !== "Payé") {
        months[i].status = "En retard";
      }
    }
  }

  const paidMonthsCount = months.filter(m => m.status === "Payé").length;
  const unpaidMonthsCount = 10 - paidMonthsCount;
  const remainingBalanceUSD = Math.max(0, totalExpectedUSD - totalPaidUSD);

  // October 2026 is index 1. If month 0 or 1 is unpaid, student is considered late for current school term
  const isUpToDate = firstUnpaidIndex > 1 || firstUnpaidIndex === -1;
  let alertMessage: string | undefined;

  if (firstUnpaidMonth) {
    alertMessage = `Cet élève n'a pas encore payé le mois de ${firstUnpaidMonth.monthLabel.toLowerCase()}.`;
  }

  return {
    studentId,
    studentName,
    className,
    months,
    totalExpectedUSD,
    annualFeeUSD: totalExpectedUSD,
    totalPaidUSD,
    remainingBalanceUSD,
    paidMonthsCount,
    unpaidMonthsCount,
    firstUnpaidMonth,
    isUpToDate,
    alertMessage
  };
}

export function getGlobalSchoolSchedules(students: Student[], payments: Payment[]) {
  const summaries = students.map(s => 
    getStudentSchedule(s.id, `${s.firstName} ${s.lastName}`, s.className, payments)
  );

  const totalStudents = students.length;
  const upToDateStudents = summaries.filter(s => s.isUpToDate).length;
  const lateStudents = summaries.filter(s => !s.isUpToDate);
  const totalUnpaidMonths = summaries.reduce((acc, s) => acc + s.unpaidMonthsCount, 0);

  // Revenue per month breakdown
  const monthlyRevenue: { [key: string]: { monthKey: string; monthLabel: string; label: string; collectedUSD: number; expectedUSD: number; paidStudentsCount: number } } = {};

  ACADEMIC_MONTHS.forEach(m => {
    monthlyRevenue[m.key] = {
      monthKey: m.key,
      monthLabel: m.label,
      label: m.label,
      collectedUSD: 0,
      expectedUSD: totalStudents * m.defaultAmount,
      paidStudentsCount: 0
    };
  });

  summaries.forEach(s => {
    s.months.forEach(m => {
      if (m.status === "Payé" && monthlyRevenue[m.monthKey]) {
        monthlyRevenue[m.monthKey].collectedUSD += m.amount;
        monthlyRevenue[m.monthKey].paidStudentsCount += 1;
      }
    });
  });

  const totalExpectedUSD = Object.values(monthlyRevenue).reduce((acc, r) => acc + r.expectedUSD, 0);
  const totalCollectedUSD = Object.values(monthlyRevenue).reduce((acc, r) => acc + r.collectedUSD, 0);
  const totalForecastRemainingUSD = totalExpectedUSD - totalCollectedUSD;

  return {
    summaries,
    totalStudents,
    upToDateStudents,
    lateStudentsCount: lateStudents.length,
    lateStudents,
    totalUnpaidMonths,
    monthlyRevenue,
    totalExpectedUSD,
    totalCollectedUSD,
    totalForecastRemainingUSD
  };
}
