import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

/**
 * Dev-only showcase page for component primitives.
 * Remove before production — exists only for visual review during Stage 1.
 */
export default function DevShowcasePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
      <h1 className="text-lg font-semibold text-text-primary">
        Component showcase
      </h1>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-text-secondary">Buttons</h2>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm">Primary sm</Button>
          <Button variant="primary">Primary default</Button>
          <Button variant="primary" size="lg">Primary lg</Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm">Secondary sm</Button>
          <Button variant="secondary">Secondary default</Button>
          <Button variant="secondary" size="lg">Secondary lg</Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" size="sm">Ghost sm</Button>
          <Button variant="ghost">Ghost default</Button>
          <Button variant="ghost" size="lg">Ghost lg</Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" disabled>Disabled primary</Button>
          <Button variant="secondary" disabled>Disabled secondary</Button>
          <Button variant="ghost" disabled>Disabled ghost</Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-text-secondary">Inputs</h2>

        <div className="grid gap-4 max-w-sm">
          <Input label="Project name" placeholder="Enter a name…" />
          <Input label="Email" placeholder="you@example.com" type="email" />
          <Input label="With error" placeholder="Something wrong" error="This field is required" />
          <Input placeholder="No label, just placeholder" />
          <Input label="Disabled" placeholder="Can't touch this" disabled />
        </div>
      </section>

      {/* Selects */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-text-secondary">Selects</h2>

        <div className="grid gap-4 max-w-sm">
          <Select
            label="Duration"
            placeholder="Choose duration"
            options={[
              { value: "15", label: "15 seconds" },
              { value: "30", label: "30 seconds" },
              { value: "60", label: "60 seconds" },
            ]}
          />
          <Select
            label="Style preset"
            options={[
              { value: "clean_saas", label: "Clean SaaS" },
              { value: "bold_launch", label: "Bold product launch" },
            ]}
          />
          <Select
            label="Disabled"
            options={[{ value: "a", label: "Option A" }]}
            disabled
          />
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-text-secondary">Cards</h2>

        <div className="grid gap-4">
          <Card>
            <p className="text-sm text-text-secondary">Default padding card</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-text-secondary">Small padding card</p>
          </Card>
          <Card padding="lg">
            <p className="text-sm text-text-secondary">Large padding card</p>
          </Card>
          <Card padding="none">
            <div className="p-5 border-b border-border">
              <p className="text-sm font-medium text-text-primary">Card header</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-text-secondary">Card with custom internal layout</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
