import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

interface Holiday {
    date: string; // ISO format YYYY-MM-DD
    localName: string;
    name: string;
    global: boolean;
    types: string[];
}

// Hardcoded Indian holidays for 2025
const INDIAN_HOLIDAYS_2025: Holiday[] = [
    {
        date: "2025-01-01",
        localName: "New Year's Day",
        name: "New Year's Day",
        global: true,
        types: ["Public"],
    },
    {
        date: "2025-01-14",
        localName: "Makar Sankranti",
        name: "Makar Sankranti",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-01-26",
        localName: "Republic Day",
        name: "Republic Day",
        global: true,
        types: ["National"],
    },
    {
        date: "2025-02-26",
        localName: "Maha Shivratri",
        name: "Maha Shivratri",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-03-13",
        localName: "Holi",
        name: "Holi",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-03-14",
        localName: "Holi (Second Day)",
        name: "Holi (Second Day)",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-03-31",
        localName: "Eid ul-Fitr",
        name: "Eid ul-Fitr",
        global: false,
        types: ["Islamic"],
    },
    {
        date: "2025-04-06",
        localName: "Ram Navami",
        name: "Ram Navami",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-04-13",
        localName: "Baisakhi",
        name: "Baisakhi",
        global: false,
        types: ["Sikh"],
    },
    {
        date: "2025-04-14",
        localName: "Ambedkar Jayanti",
        name: "Ambedkar Jayanti",
        global: true,
        types: ["National"],
    },
    {
        date: "2025-04-18",
        localName: "Good Friday",
        name: "Good Friday",
        global: false,
        types: ["Christian"],
    },
    {
        date: "2025-05-01",
        localName: "Labour Day",
        name: "Labour Day",
        global: true,
        types: ["Public"],
    },
    {
        date: "2025-05-12",
        localName: "Buddha Purnima",
        name: "Buddha Purnima",
        global: false,
        types: ["Buddhist"],
    },
    {
        date: "2025-06-07",
        localName: "Eid ul-Adha",
        name: "Eid ul-Adha",
        global: false,
        types: ["Islamic"],
    },
    {
        date: "2025-08-15",
        localName: "Independence Day",
        name: "Independence Day",
        global: true,
        types: ["National"],
    },
    {
        date: "2025-08-16",
        localName: "Parsi New Year",
        name: "Parsi New Year",
        global: false,
        types: ["Parsi"],
    },
    {
        date: "2025-08-27",
        localName: "Janmashtami",
        name: "Janmashtami",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-09-07",
        localName: "Ganesh Chaturthi",
        name: "Ganesh Chaturthi",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-10-02",
        localName: "Gandhi Jayanti",
        name: "Gandhi Jayanti",
        global: true,
        types: ["National"],
    },
    {
        date: "2025-10-20",
        localName: "Dussehra",
        name: "Dussehra",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-10-31",
        localName: "Karva Chauth",
        name: "Karva Chauth",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-11-01",
        localName: "Diwali",
        name: "Diwali",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-11-02",
        localName: "Govardhan Puja",
        name: "Govardhan Puja",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-11-03",
        localName: "Bhai Dooj",
        name: "Bhai Dooj",
        global: false,
        types: ["Hindu"],
    },
    {
        date: "2025-11-05",
        localName: "Guru Nanak Jayanti",
        name: "Guru Nanak Jayanti",
        global: false,
        types: ["Sikh"],
    },
    {
        date: "2025-12-25",
        localName: "Christmas Day",
        name: "Christmas Day",
        global: true,
        types: ["Christian"],
    },
];

export default function Holidays() {
    const currentYear = new Date().getFullYear();
    const [query, setQuery] = useState("");
    const holidays = INDIAN_HOLIDAYS_2025;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return holidays;
        return holidays.filter(
            (h) =>
                h.name.toLowerCase().includes(q) ||
                h.localName.toLowerCase().includes(q)
        );
    }, [holidays, query]);

    const byMonth = useMemo(() => {
        const map = new Map<number, Holiday[]>();
        for (const h of filtered) {
            const m = new Date(h.date).getMonth();
            if (!map.has(m)) map.set(m, []);
            map.get(m)!.push(h);
        }
        return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
    }, [filtered]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <CalendarDays className="w-7 h-7" /> India Public Holidays{" "}
                    {currentYear}
                </h1>
                <p className="text-muted-foreground">
                    Complete list of Indian public holidays for 2025
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Search Holidays</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label>Search by name</Label>
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. Diwali, Holi, Republic Day"
                        />
                    </div>
                </CardContent>
            </Card>

            {byMonth.length === 0 ? (
                <Card>
                    <CardContent className="py-6 text-muted-foreground">
                        No holidays found.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {byMonth.map(([monthIndex, items]) => (
                        <Card key={monthIndex}>
                            <CardHeader>
                                <CardTitle>
                                    {new Date(
                                        currentYear,
                                        monthIndex
                                    ).toLocaleString("en-IN", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {items
                                    .sort((a, b) =>
                                        a.date.localeCompare(b.date)
                                    )
                                    .map((h) => (
                                        <div
                                            key={h.date + h.name}
                                            className="py-3 flex items-start justify-between gap-4"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {h.localName}{" "}
                                                    <span className="text-muted-foreground">
                                                        ({h.name})
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(
                                                        h.date
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            weekday: "long",
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {h.global && (
                                                    <Badge variant="secondary">
                                                        Global
                                                    </Badge>
                                                )}
                                                {h.types?.map((t) => (
                                                    <Badge
                                                        key={t}
                                                        variant="outline"
                                                    >
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
