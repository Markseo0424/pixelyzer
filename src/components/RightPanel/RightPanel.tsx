"use client";
import * as Tabs from "@radix-ui/react-tabs";
import GridSettings from "./GridSettings";
import PaletteManager from "./PaletteManager";

export default function RightPanel() {
  return (
    <div className="h-full w-full border-l border-neutral-200 dark:border-neutral-800 bg-[var(--background)] text-[var(--foreground)]">
      <Tabs.Root className="flex flex-col h-full" defaultValue="grid">
        <Tabs.List className="flex border-b border-neutral-200 dark:border-neutral-800">
          <Tabs.Trigger
            value="grid"
            className="px-3 py-2 text-sm data-[state=active]:font-semibold"
          >
            Grid
          </Tabs.Trigger>
          <Tabs.Trigger
            value="palette"
            className="px-3 py-2 text-sm data-[state=active]:font-semibold"
          >
            Palette
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="grid" className="p-3 overflow-auto grow">
          <GridSettings />
        </Tabs.Content>
        <Tabs.Content value="palette" className="p-3 overflow-auto grow">
          <PaletteManager />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
