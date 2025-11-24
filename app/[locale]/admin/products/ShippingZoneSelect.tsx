"use client";

import { useTranslations } from "next-intl";
import useSWR from "swr";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES } from "@/types/countries";

type ShippingZone = {
  id: number;
  name: string | null;
  countries: { countryCode: string }[];
};

type ShippingZoneSelectProps = {
  value?: number;
  onChange: (zoneId: number, zone: ShippingZone) => void;
  excludeZoneIds?: number[];
};

async function fetcher(url: string) {
  const response = await axios.get(url);
  return response.data;
}

export default function ShippingZoneSelect({ value, onChange, excludeZoneIds = [] }: ShippingZoneSelectProps) {
  const t = useTranslations("products");

  const { data, error, isLoading } = useSWR<{ data: ShippingZone[] }>("/api/shipping-zones?limit=1000", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const zones = data?.data || [];

  const availableZones = zones.filter((z) => !excludeZoneIds.includes(z.id));
  const selectedZone = zones.find((z) => z.id === value);

  const getZoneDisplay = (zone: ShippingZone) => {
    const countryNames = zone.countries
      .slice(0, 3)
      .map((c) => {
        const country = COUNTRIES.find((co) => co.alpha2 === c.countryCode);
        return country?.name || c.countryCode;
      })
      .join(", ");

    const more = zone.countries.length > 3 ? ` +${zone.countries.length - 3}` : "";

    return zone.name ? `${zone.name} (${countryNames}${more})` : `${countryNames}${more}`;
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder={t("loading...")} />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => {
        const zoneId = parseInt(val);
        const zone = zones.find((z) => z.id === zoneId);
        if (zone) {
          onChange(zoneId, zone);
        }
      }}
    >
      <SelectTrigger className="w-0 min-w-full text-start">
        <span className="truncate">{selectedZone ? getZoneDisplay(selectedZone) : t("select")}</span>
      </SelectTrigger>
      <SelectContent>
        {availableZones.length === 0 ? (
          <SelectItem value="none" disabled>
            {t("no shipping zones available")}
          </SelectItem>
        ) : (
          availableZones.map((zone) => (
            <SelectItem key={zone.id} value={zone.id.toString()}>
              {getZoneDisplay(zone)}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
