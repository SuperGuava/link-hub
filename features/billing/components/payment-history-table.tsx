import type { PaymentRecord } from "@/types/billing";
import { formatKstDateTime } from "@/lib/format-datetime";

type PaymentHistoryTableProps = {
  payments: PaymentRecord[];
};

function statusText(status: PaymentRecord["status"]) {
  switch (status) {
    case "DONE":
      return "완료";
    case "FAILED":
      return "실패";
    case "CANCELED":
      return "취소";
    default:
      return status;
  }
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">결제 이력이 없습니다.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 font-medium">결제 수단</th>
            <th className="px-4 py-3 font-medium">금액</th>
            <th className="px-4 py-3 font-medium">주문 번호</th>
            <th className="px-4 py-3 font-medium">결제일</th>
            <th className="px-4 py-3 font-medium">상태</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">{payment.method}</td>
              <td className="px-4 py-3">{formatAmount(payment.amount)}</td>
              <td className="px-4 py-3 font-mono text-xs">{payment.orderId}</td>
              <td className="px-4 py-3">
                {payment.paidAt
                  ? formatKstDateTime(payment.paidAt)
                  : formatKstDateTime(payment.createdAt)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    payment.status === "FAILED"
                      ? "text-destructive"
                      : "text-foreground"
                  }
                >
                  {statusText(payment.status)}
                </span>
                {payment.failureMessage ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {payment.failureMessage}
                  </p>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
