import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Button, Field, Input, Textarea } from "../components/ui";

export default function SettingsPage() {
  const { user, farmerProfile, reload } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [farmName, setFarmName] = useState(farmerProfile?.farmName || "");
  const [bio, setBio] = useState(farmerProfile?.bio || "");
  const [saved, setSaved] = useState(false);

  async function save(e) {
    e.preventDefault();
    await api.patch("/auth/me", {
      name,
      phone,
      farmerProfile: { farmName, bio },
    });
    await reload();
    setSaved(true);
  }

  return (
    <form onSubmit={save} className="card max-w-xl space-y-3 p-5">
      <Field label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Phone">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      {user?.role === "farmer" && (
        <>
          <Field label="Farm name">
            <Input value={farmName} onChange={(e) => setFarmName(e.target.value)} />
          </Field>
          <Field label="Public bio">
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          </Field>
        </>
      )}
      <Button>Save</Button>
      {saved && <p className="text-sm text-sage">Saved.</p>}
    </form>
  );
}
