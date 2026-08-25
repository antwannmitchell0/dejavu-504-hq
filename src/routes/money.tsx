import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { Card, PageHeader, Stat } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money as moneyFmt } from "@/lib/format";
import { useHQ } from "@/lib/store";

export const Route = createFileRoute("/money")({ component: MoneyPage });

const incomeCats = ["Shows", "Merch", "Streaming", "Features", "Sponsorships", "Other"];
const expenseCats = ["Studio", "Travel", "Ads", "Photoshoot", "Other"];

function MoneyPage() {
  const entries = useHQ((s) => s.money);
  const addMoney = useHQ((s) => s.addMoney);
  const [kind, setKind] = useState<"income" | "expense">("income");

  const totals = useMemo(() => {
    const income = entries.filter((e) => e.kind === "income").reduce((a, b) => a + b.amount, 0);
    const expense = entries.filter((e) => e.kind === "expense").reduce((a, b) => a + b.amount, 0);
    const byCat = new Map<string, number>();
    for (const e of entries.filter((x) => x.kind === "income")) {
      byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount);
    }
    const chart = incomeCats.map((c) => ({ name: c, amount: byCat.get(c) ?? 0 }));
    return { income, expense, net: income - expense, chart };
  }, [entries]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const amount = Number(form.get("amount"));
    if (!amount) return;
    addMoney({
      kind,
      category: String(form.get("category") || "Other"),
      amount,
      date: new Date().toISOString().slice(0, 10),
      note: String(form.get("note") || ""),
    });
    e.currentTarget.reset();
  }

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="Keep it simple" title="My Money" />
        <div className="space-y-5 px-5">
          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="In" value={moneyFmt(totals.income)} />
            <Stat label="Out" value={moneyFmt(totals.expense)} />
          </div>
          <Stat label="Kept" value={moneyFmt(totals.net)} hint="This year so far" />

          <div className="h-44 rounded-xl bg-surface px-2 py-3 shadow-card">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={totals.chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--color-subtle)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Bar dataKey="amount" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <form onSubmit={onSubmit} className="space-y-3 rounded-xl bg-surface p-4 shadow-card">
            <div className="flex gap-1.5">
              {(["income", "expense"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`h-8 flex-1 rounded-full text-xs capitalize ${
                    kind === k ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input name="amount" type="number" min={1} placeholder="0" required />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select
                  name="category"
                  className="h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-card outline-none"
                >
                  {(kind === "income" ? incomeCats : expenseCats).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <Input name="note" placeholder="Note" />
            <Button type="submit" className="w-full">
              Add
            </Button>
          </form>

          <div className="space-y-2">
            {entries.slice(0, 12).map((e) => (
              <Card key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm">{e.note || e.category}</p>
                  <p className="text-xs text-muted">
                    {e.category} · {e.date}
                  </p>
                </div>
                <p className={`text-sm tabular ${e.kind === "expense" ? "text-danger" : "text-fg"}`}>
                  {e.kind === "expense" ? "−" : "+"}
                  {moneyFmt(e.amount)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Screen>
    </AppShell>
  );
}
