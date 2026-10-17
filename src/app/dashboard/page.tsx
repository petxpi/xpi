"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Cropper from "react-easy-crop";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, ScatterChart, Scatter, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import PWAInstallButton from "@/components/PWAInstallButton";

export default function DashboardPage() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [editingPet, setEditingPet] = useState<any>(null);
  const [showMap, setShowMap] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showVaccines, setShowVaccines] = useState(false);
  const [selectedPetForVaccines, setSelectedPetForVaccines] = useState<any>(null);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({
    vaccine_name: "",
    date_administered: "",
    next_due: "",
    lot_number: "",
    vet_name: "",
  });

  const [showVet, setShowVet] = useState(false);
  const [selectedPetForVet, setSelectedPetForVet] = useState<any>(null);
  const [vetData, setVetData] = useState({ vetName: "", clinicName: "", phone: "", address: "", notes: "" });
  const [loadingVet, setLoadingVet] = useState(false);
  const [vetIsPublic, setVetIsPublic] = useState(true);

  const [showAllergies, setShowAllergies] = useState(false);
  const [selectedPetForAllergies, setSelectedPetForAllergies] = useState<any>(null);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [allergyForm, setAllergyForm] = useState({
    allergyType: "food",
    allergen: "",
    severity: "moderate",
    symptoms: "",
    treatment: "",
    isPublic: true,
  });

  const [showMedications, setShowMedications] = useState(false);
  const [selectedPetForMedications, setSelectedPetForMedications] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    medicationName: "",
    dosage: "",
    frequency: "Diaria",
    schedule: "",
    reason: "",
    prescribedBy: "",
    startDate: "",
    endDate: "",
    isPublic: true,
  });

  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [selectedPetForMedicalHistory, setSelectedPetForMedicalHistory] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [showAddMedicalEvent, setShowAddMedicalEvent] = useState(false);
  const [medicalHistoryForm, setMedicalHistoryForm] = useState({
    condition: "",
    conditionType: "illness",
    date: "",
    description: "",
    treatment: "",
    vetName: "",
    cost: "",
    recovered: true,
    isPublic: true,
  });

  const [showDeworming, setShowDeworming] = useState(false);
  const [selectedPetForDeworming, setSelectedPetForDeworming] = useState<any>(null);
  const [dewormings, setDewormings] = useState<any[]>([]);
  const [showAddDeworming, setShowAddDeworming] = useState(false);
  const [dewormingForm, setDewormingForm] = useState({
    dewormingType: "internal",
    productName: "",
    dateApplied: "",
    nextDate: "",
    isPublic: true,
  });

  const [showWeight, setShowWeight] = useState(false);
  const [selectedPetForWeight, setSelectedPetForWeight] = useState<any>(null);
  const [weights, setWeights] = useState<any[]>([]);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [weightForm, setWeightForm] = useState({
    weight: "",
    date: "",
    notes: "",
    isPublic: true,
  });

  const [chartType, setChartType] = useState<"line" | "area" | "bar" | "radar" | "scatter">("line");
  const [chartTheme, setChartTheme] = useState("xpipet");
  const [showAnimations, setShowAnimations] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertSummary, setAlertSummary] = useState({ total: 0, critical: 0, warning: 0, info: 0 });
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [selectedPetForAlerts, setSelectedPetForAlerts] = useState<any>(null);

  const [reminderEmail, setReminderEmail] = useState("");
  const [sendingReminder, setSendingReminder] = useState(false);

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationHistory, setLocationHistory] = useState<any[]>([]);
  const [addressCache, setAddressCache] = useState<Record<string, string>>({});
  const [loadingAddresses, setLoadingAddresses] = useState<Record<string, boolean>>({});
  const [lostReport, setLostReport] = useState("");
  const [showLostModal, setShowLostModal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    color: "",
    sex: "",
    microchip: "",
    photo: "",
  });

  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropMode, setCropMode] = useState<"create" | "edit">("create");
  const [cropPetId, setCropPetId] = useState<string>("");

  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    if (cropImage && !croppedAreaPixels) {
      setCroppedAreaPixels({ x: 0, y: 0, width: 100, height: 100 });
    }
  }, [cropImage, croppedAreaPixels]);

  async function checkAuth() {
    try {
      const response = await fetch("/api/pets");
      if (response.status === 401) router.push("/login");
      else loadPets();
    } catch (error) { router.push("/login"); }
  }

  async function loadPets() {
    try {
      const response = await fetch("/api/pets");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar mascotas");
      setPets(data.pets || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No context");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => { if (blob) resolve(blob); }, "image/jpeg");
    });
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>, mode: "create" | "edit", petId?: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setCropMode(mode);
      setShowCropModal(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
      if (petId) setCropPetId(petId);
    };
    reader.readAsDataURL(file);
  }

  async function handleCropSave() {
    if (!cropImage || !croppedAreaPixels) {
      alert("Error: No se pudo procesar la imagen.");
      return;
    }
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      const formDataUpload = new FormData();
      formDataUpload.append("file", croppedBlob, "cropped-image.jpg");

      const res = await fetch("/api/upload", { method: "POST", body: formDataUpload });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFormData(prev => ({ ...prev, photo: data.url }));

      if (cropMode === "edit" && cropPetId) {
        const updateRes = await fetch(`/api/pets/${cropPetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name || "Sin nombre",
            species: formData.species || "dog",
            breed: formData.breed || null,
            color: formData.color || null,
            sex: formData.sex || null,
            microchip: formData.microchip || null,
            photo: data.url,
          }),
        });
        if (!updateRes.ok) {
          const updateData = await updateRes.json();
          throw new Error(updateData.message || "Error al actualizar la foto");
        }
        await loadPets();
      }

      setShowCropModal(false);
      setCropImage("");
      setCroppedAreaPixels(null);
    } catch (err: any) {
      alert("Error al subir foto: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreatePet(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al crear mascota");
      alert("Mascota creada! Codigo: " + data.publicId);
      setShowForm(false);
      setFormData({ name: "", species: "", breed: "", color: "", sex: "", microchip: "", photo: "" });
      loadPets();
    } catch (err: any) { setError(err.message); }
  }

  async function handleUpdatePet(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!editingPet) return;
    try {
      const response = await fetch(`/api/pets/${editingPet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al actualizar mascota");
      alert("Mascota actualizada!");
      setEditingPet(null);
      setFormData({ name: "", species: "", breed: "", color: "", sex: "", microchip: "", photo: "" });
      loadPets();
    } catch (err: any) { setError(err.message); }
  }

  async function handleDeletePet(petId: string) {
    if (!confirm("Estas seguro de eliminar esta mascota?")) return;
    try {
      const response = await fetch(`/api/pets/${petId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar");
      loadPets();
    } catch (err: any) { setError(err.message); }
  }

  async function reportLost(petId: string, report: string) {
    try {
      const response = await fetch(`/api/pets/${petId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "lost", lost_report: report }),
      });
      if (!response.ok) throw new Error("Error al reportar");
      alert("Mascota reportada como PERDIDA");
      setShowLostModal(null);
      setLostReport("");
      loadPets();
    } catch (err: any) { alert(err.message); }
  }

  async function reportFound(petId: string) {
    try {
      const response = await fetch(`/api/pets/${petId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "home", lost_report: null }),
      });
      if (!response.ok) throw new Error("Error al actualizar");
      alert("Mascota marcada como ENCONTRADA");
      loadPets();
    } catch (err: any) { alert(err.message); }
  }

  function openEditModal(pet: any) {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      color: pet.color || "",
      sex: pet.sex || "",
      microchip: pet.microchip || "",
      photo: pet.photo_url || "",
    });
  }

  function closeEditModal() {
    setEditingPet(null);
    setFormData({ name: "", species: "", breed: "", color: "", sex: "", microchip: "", photo: "" });
  }

  function downloadQR() {
    if (!selectedPet) return;
    const svg = document.getElementById(`qr-${selectedPet.public_id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) { alert("Error al generar el QR"); return; }
    const img = new Image();
    img.onload = () => {
      canvas.width = 512; canvas.height = 512;
      ctx.fillStyle = "white"; ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${selectedPet.name}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }

  function getCurrentPosition() {
    if (!navigator.geolocation) { alert("Tu navegador no soporta geolocalizacion"); return; }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (showMap) await updatePetLocation(showMap.id, latitude, longitude);
      },
      (error) => alert("Error al obtener ubicacion: " + error.message)
    );
  }

  async function saveLocationToHistory(petId: string, lat: number, lng: number) {
    try {
      await fetch(`/api/pets/${petId}/location-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, accuracy: 10 }),
      });
    } catch (err) { console.error("Error al guardar en historial:", err); }
  }

  async function updatePetLocation(petId: string, lat: number, lng: number) {
    try {
      const response = await fetch(`/api/pets/${petId}/location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
      if (!response.ok) throw new Error("Error al actualizar ubicacion");
      await saveLocationToHistory(petId, lat, lng);
      alert("Ubicacion actualizada");
      loadPets();
    } catch (err: any) { alert(err.message); }
  }

  async function toggleGPS(pet: any, enabled: boolean) {
    try {
      const response = await fetch(`/api/pets/${pet.id}/gps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error("Error al cambiar GPS");
      loadPets();
    } catch (err: any) { alert(err.message); }
  }

  async function getAddress(lat: number, lng: number): Promise<string> {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (addressCache[key]) return addressCache[key];
    try {
      setLoadingAddresses(prev => ({ ...prev, [key]: true }));
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'XpiPet/1.0' } }
      );
      if (!response.ok) return "Direccion no disponible";
      const data = await response.json();
      let address = "Direccion no disponible";
      const addr = data.address || {};
      if (addr.road) {
        address = addr.road;
        if (addr.house_number) address += ` #${addr.house_number}`;
        if (addr.suburb || addr.neighbourhood || addr.residential) {
          address += `, ${addr.suburb || addr.neighbourhood || addr.residential}`;
        }
      } else if (addr.suburb || addr.neighbourhood) {
        address = addr.suburb || addr.neighbourhood;
      } else if (data.display_name) {
        const parts = data.display_name.split(',');
        address = parts.slice(0, 2).join(',').trim();
      }
      setAddressCache(prev => ({ ...prev, [key]: address }));
      setLoadingAddresses(prev => ({ ...prev, [key]: false }));
      return address;
    } catch (err) {
      console.error("Error al obtener direccion:", err);
      return "Direccion no disponible";
    }
  }

  async function loadLocationHistory(pet: any) {
    try {
      const response = await fetch(`/api/pets/${pet.id}/location-history`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar historial");
      setLocationHistory(data.locations || []);
      setShowMap(pet);
      setShowHistory(true);
      const locations = data.locations || [];
      for (const loc of locations) {
        const lat = parseFloat(loc.latitude || loc.lat);
        const lng = parseFloat(loc.longitude || loc.lng);
        if (!isNaN(lat) && !isNaN(lng)) await getAddress(lat, lng);
      }
    } catch (err: any) { alert(err.message); }
  }

  async function openMap(pet: any) {
    setShowMap(pet);
    if (pet.last_known_location_lat && pet.last_known_location_lng) {
      setUserLocation({ lat: pet.last_known_location_lat, lng: pet.last_known_location_lng });
    } else {
      getCurrentPosition();
    }
  }

  async function openVaccines(pet: any) {
    setSelectedPetForVaccines(pet);
    setShowVaccines(true);
    setShowAddVaccine(false);
    setVaccinations([]);
    await loadVaccinations(pet.id);
  }

  async function loadVaccinations(petId: string) {
    try {
      const response = await fetch(`/api/pets/${petId}/vaccinations`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar vacunas");
      setVaccinations(data.vaccinations || []);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al cargar vacunas");
    }
  }

  async function handleAddVaccine(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetForVaccines) { alert("Error: No hay mascota seleccionada"); return; }
    const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Guardando..."; }
    try {
      const response = await fetch(`/api/pets/${selectedPetForVaccines.id}/vaccinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vaccineForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al registrar vacuna");
      alert("Vacuna registrada correctamente");
      setShowAddVaccine(false);
      setVaccineForm({ vaccine_name: "", date_administered: "", next_due: "", lot_number: "", vet_name: "" });
      await loadVaccinations(selectedPetForVaccines.id);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al registrar vacuna");
    } finally {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Guardar vacuna"; }
    }
  }

  async function handleDeleteVaccine(vaccinationId: string) {
    if (!confirm("Estas seguro de eliminar esta vacuna?")) return;
    try {
      const response = await fetch(`/api/pets/${vaccinationId}/vaccinations`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar");
      if (selectedPetForVaccines) await loadVaccinations(selectedPetForVaccines.id);
    } catch (err: any) { alert(err.message || "Error al eliminar vacuna"); }
  }

  async function openVet(pet: any) {
    setSelectedPetForVet(pet);
    setShowVet(true);
    setLoadingVet(true);
    setVetData({ vetName: "", clinicName: "", phone: "", address: "", notes: "" });
    setVetIsPublic(true);
    try {
      const response = await fetch(`/api/veterinarians?petId=${pet.id}`);
      const data = await response.json();
      if (data.vet) {
        setVetData({
          vetName: data.vet.vet_name || "",
          clinicName: data.vet.clinic_name || "",
          phone: data.vet.phone || "",
          address: data.vet.address || "",
          notes: data.vet.notes || "",
        });
        setVetIsPublic(data.vet.public === 1);
      }
    } catch (err) {
      console.error("Error al cargar veterinario:", err);
    } finally {
      setLoadingVet(false);
    }
  }

  async function handleSaveVet(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetForVet) return;
    try {
      const response = await fetch("/api/veterinarians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPetForVet.id,
          vetName: vetData.vetName,
          clinicName: vetData.clinicName,
          phone: vetData.phone,
          address: vetData.address,
          notes: vetData.notes,
          isPublic: vetIsPublic,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert("Veterinario guardado correctamente");
      setShowVet(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  async function handleDeleteVet() {
    if (!selectedPetForVet) return;
    if (!confirm("Eliminar el veterinario registrado?")) return;
    try {
      const response = await fetch("/api/veterinarians", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId: selectedPetForVet.id }),
      });
      if (!response.ok) throw new Error("Error al eliminar");
      alert("Veterinario eliminado");
      setShowVet(false);
      setVetData({ vetName: "", clinicName: "", phone: "", address: "", notes: "" });
      setVetIsPublic(true);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  async function openAllergies(pet: any) {
    setSelectedPetForAllergies(pet);
    setShowAllergies(true);
    setShowAddAllergy(false);
    setAllergies([]);
    await loadAllergies(pet.id);
  }

  async function loadAllergies(petId: string) {
    try {
      const response = await fetch(`/api/pet-allergies?petId=${petId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar alergias");
      setAllergies(data.allergies || []);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al cargar alergias");
    }
  }

  async function handleAddAllergy(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetForAllergies) { alert("Error: No hay mascota seleccionada"); return; }
    if (!allergyForm.allergen.trim()) { alert("Debes indicar el alergeno"); return; }
    try {
      const response = await fetch("/api/pet-allergies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPetForAllergies.id,
          allergyType: allergyForm.allergyType,
          allergen: allergyForm.allergen,
          severity: allergyForm.severity,
          symptoms: allergyForm.symptoms,
          treatment: allergyForm.treatment,
          isPublic: allergyForm.isPublic,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al registrar alergia");
      alert("Alergia registrada correctamente");
      setShowAddAllergy(false);
      setAllergyForm({ allergyType: "food", allergen: "", severity: "moderate", symptoms: "", treatment: "", isPublic: true });
      await loadAllergies(selectedPetForAllergies.id);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al registrar alergia");
    }
  }

  async function handleDeleteAllergy(allergyId: string) {
    if (!confirm("Estas seguro de eliminar esta alergia?")) return;
    try {
      const response = await fetch("/api/pet-allergies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergyId, petId: selectedPetForAllergies.id }),
      });
      if (!response.ok) throw new Error("Error al eliminar");
      await loadAllergies(selectedPetForAllergies.id);
    } catch (err: any) { alert(err.message || "Error al eliminar alergia"); }
  }

  async function handleToggleAllergyPublic(allergyId: string) {
    try {
      const response = await fetch("/api/pet-allergies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergyId, petId: selectedPetForAllergies.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      await loadAllergies(selectedPetForAllergies.id);
    } catch (err: any) { alert(err.message || "Error al cambiar visibilidad"); }
  }

  async function openMedications(pet: any) {
    setSelectedPetForMedications(pet);
    setShowMedications(true);
    setShowAddMedication(false);
    setMedications([]);
    await loadMedications(pet.id);
  }

  async function loadMedications(petId: string) {
    try {
      const response = await fetch(`/api/pet-medications?petId=${petId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar medicamentos");
      setMedications(data.medications || []);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al cargar medicamentos");
    }
  }

  async function handleAddMedication(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetForMedications) { alert("Error: No hay mascota seleccionada"); return; }
    if (!medicationForm.medicationName.trim() || !medicationForm.dosage.trim()) { 
      alert("Debes indicar el nombre del medicamento y la dosis"); 
      return; 
    }
    try {
      const response = await fetch("/api/pet-medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPetForMedications.id,
          medicationName: medicationForm.medicationName,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          schedule: medicationForm.schedule,
          reason: medicationForm.reason,
          prescribedBy: medicationForm.prescribedBy,
          startDate: medicationForm.startDate,
          endDate: medicationForm.endDate,
          isPublic: medicationForm.isPublic,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al registrar medicamento");
      alert("Medicamento registrado correctamente");
      setShowAddMedication(false);
      setMedicationForm({
        medicationName: "", dosage: "", frequency: "Diaria", schedule: "",
        reason: "", prescribedBy: "", startDate: "", endDate: "", isPublic: true,
      });
      await loadMedications(selectedPetForMedications.id);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al registrar medicamento");
    }
  }

  async function handleDeleteMedication(medicationId: string) {
    if (!confirm("Estas seguro de eliminar este medicamento?")) return;
    try {
      const response = await fetch("/api/pet-medications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicationId, petId: selectedPetForMedications.id }),
      });
      if (!response.ok) throw new Error("Error al eliminar");
      await loadMedications(selectedPetForMedications.id);
    } catch (err: any) { alert(err.message || "Error al eliminar medicamento"); }
  }

  async function handleToggleMedicationPublic(medicationId: string) {
    try {
      const response = await fetch("/api/pet-medications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicationId, petId: selectedPetForMedications.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      await loadMedications(selectedPetForMedications.id);
    } catch (err: any) { alert(err.message || "Error al cambiar visibilidad"); }
  }

  async function openMedicalHistory(pet: any) {
    setSelectedPetForMedicalHistory(pet);
    setShowMedicalHistory(true);
    setShowAddMedicalEvent(false);
    setMedicalHistory([]);
    await loadMedicalHistory(pet.id);
  }

  async function loadMedicalHistory(petId: string) {
    try {
      const response = await fetch(`/api/pet-medical-history?petId=${petId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar historial");
      setMedicalHistory(data.history || []);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al cargar historial");
    }
  }

  async function handleAddMedicalEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetForMedicalHistory) return;
    if (!medicalHistoryForm.condition.trim() || !medicalHistoryForm.date) { 
      alert("Debes indicar la condicion y la fecha"); 
      return; 
    }
    try {
      const response = await fetch("/api/pet-medical-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPetForMedicalHistory.id,
          condition: medicalHistoryForm.condition,
          conditionType: medicalHistoryForm.conditionType,
          date: medicalHistoryForm.date,
          description: medicalHistoryForm.description,
          treatment: medicalHistoryForm.treatment,
          vetName: medicalHistoryForm.vetName,
          cost: medicalHistoryForm.cost,
          recovered: medicalHistoryForm.recovered,
          isPublic: medicalHistoryForm.isPublic,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert("Evento medico registrado correctamente");
      setShowAddMedicalEvent(false);
      setMedicalHistoryForm({
        condition: "", conditionType: "illness", date: "", description: "",
        treatment: "", vetName: "", cost: "", recovered: true, isPublic: true,
      });
      await loadMedicalHistory(selectedPetForMedicalHistory.id);
    } catch (err: any) {
      alert(err.message || "Error al registrar evento");
    }
  }

  async function handleDeleteMedicalEvent(historyId: string) {
    if (!confirm("Estas seguro de eliminar este evento del historial?")) return;
    try {
      const response = await fetch("/api/pet-medical-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId, petId: selectedPetForMedicalHistory.id }),
      });
      if (!response.ok) throw new Error("Error al eliminar");
      await loadMedicalHistory(selectedPetForMedicalHistory.id);
    } catch (err: any) { alert(err.message); }
  }

  async function handleToggleMedicalHistoryPublic(historyId: string) {
    try {
      const response = await fetch("/api/pet-medical-history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId, petId: selectedPetForMedicalHistory.id }),
      });
      if (!response.ok) throw new Error("Error al cambiar visibilidad");
      await loadMedicalHistory(selectedPetForMedicalHistory.id);
    } catch (err: any) { alert(err.message); }
  }

  async function openDeworming(pet: any) {
    setSelectedPetForDeworming(pet);
    setShowDeworming(true);
    setShowAddDeworming(false);
    setDewormings([]);
    await loadDewormings(pet.id);
  }

  async function loadDewormings(petId: string) {
    try {
      const response = await fetch(`/api/pet-deworming?petId=${petId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar desparasitaciones");
      setDewormings(data.dewormings || []);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al cargar desparasitaciones");
    }
  }

  async function handleAddDeworming(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetForDeworming) return;
    if (!dewormingForm.productName.trim() || !dewormingForm.dateApplied) { 
      alert("Debes indicar el producto y la fecha de aplicacion"); 
      return; 
    }
    try {
      const response = await fetch("/api/pet-deworming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPetForDeworming.id,
          dewormingType: dewormingForm.dewormingType,
          productName: dewormingForm.productName,
          dateApplied: dewormingForm.dateApplied,
          nextDate: dewormingForm.nextDate,
          isPublic: dewormingForm.isPublic,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert("Desparasitacion registrada correctamente");
      setShowAddDeworming(false);
      setDewormingForm({
        dewormingType: "internal", productName: "", dateApplied: "",
        nextDate: "", isPublic: true,
      });
      await loadDewormings(selectedPetForDeworming.id);
    } catch (err: any) {
      alert(err.message || "Error al registrar desparasitacion");
    }
  }

  async function handleDeleteDeworming(dewormingId: string) {
    if (!confirm("Estas seguro de eliminar esta desparasitacion?")) return;
    try {
      const response = await fetch("/api/pet-deworming", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dewormingId, petId: selectedPetForDeworming.id }),
      });
      if (!response.ok) throw new Error("Error al eliminar");
      await loadDewormings(selectedPetForDeworming.id);
    } catch (err: any) { alert(err.message); }
  }

  async function handleToggleDewormingPublic(dewormingId: string) {
    try {
      const response = await fetch("/api/pet-deworming", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dewormingId, petId: selectedPetForDeworming.id }),
      });
      if (!response.ok) throw new Error("Error al cambiar visibilidad");
      await loadDewormings(selectedPetForDeworming.id);
    } catch (err: any) { alert(err.message); }
  }

  async function openWeight(pet: any) {
    setSelectedPetForWeight(pet);
    setShowWeight(true);
    setShowAddWeight(false);
    setWeights([]);
    await loadWeights(pet.id);
  }

  async function loadWeights(petId: string) {
    try {
      const response = await fetch(`/api/pet-weights?petId=${petId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar pesos");
      setWeights(data.weights || []);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al cargar pesos");
    }
  }

  async function handleAddWeight(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetForWeight) return;
    if (!weightForm.weight || !weightForm.date) { 
      alert("Debes indicar el peso y la fecha"); 
      return; 
    }
    try {
      const response = await fetch("/api/pet-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPetForWeight.id,
          weight: parseFloat(weightForm.weight),
          date: weightForm.date,
          notes: weightForm.notes,
          isPublic: weightForm.isPublic,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert("Peso registrado correctamente");
      setShowAddWeight(false);
      setWeightForm({ weight: "", date: "", notes: "", isPublic: true });
      await loadWeights(selectedPetForWeight.id);
    } catch (err: any) {
      alert(err.message || "Error al registrar peso");
    }
  }

  async function handleDeleteWeight(weightId: string) {
    if (!confirm("Estas seguro de eliminar este registro de peso?")) return;
    try {
      const response = await fetch("/api/pet-weights", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightId, petId: selectedPetForWeight.id }),
      });
      if (!response.ok) throw new Error("Error al eliminar");
      await loadWeights(selectedPetForWeight.id);
    } catch (err: any) { alert(err.message); }
  }

  async function handleToggleWeightPublic(weightId: string) {
    try {
      const response = await fetch("/api/pet-weights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightId, petId: selectedPetForWeight.id }),
      });
      if (!response.ok) throw new Error("Error al cambiar visibilidad");
      await loadWeights(selectedPetForWeight.id);
    } catch (err: any) { alert(err.message); }
  }

  async function loadAlerts(petId: string) {
    try {
      const response = await fetch(`/api/pet-alerts?petId=${petId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar alertas");
      setAlerts(data.alerts || []);
      setAlertSummary(data.summary || { total: 0, critical: 0, warning: 0, info: 0 });
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al cargar alertas");
    }
  }

  function openAlertsPanel(pet: any) {
    setSelectedPetForAlerts(pet);
    setShowAlertsPanel(true);
    loadAlerts(pet.id);
  }

  function handleAlertAction(alertData: any) {
    setShowAlertsPanel(false);
    
    switch (alertData.type) {
      case "vaccine":
        openVaccines(selectedPetForAlerts);
        break;
      case "deworming":
        openDeworming(selectedPetForAlerts);
        break;
      case "medication":
        openMedications(selectedPetForAlerts);
        break;
      case "weight":
        openWeight(selectedPetForAlerts);
        break;
      case "medical":
        openMedicalHistory(selectedPetForAlerts);
        break;
      default:
        alert("Accion no disponible");
    }
  }

  async function handleSendReminder(alertData: any) {
    if (!reminderEmail.trim()) {
      alert("Por favor ingresa un email destinatario");
      return;
    }

    setSendingReminder(true);
    try {
      const response = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: reminderEmail,
          petName: selectedPetForAlerts.name,
          subject: alertData.title,
          message: alertData.message,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al enviar");

      alert("✅ Recordatorio enviado correctamente a " + reminderEmail);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSendingReminder(false);
    }
  }

  function handleLogout() {
    document.cookie = "auth-token=; path=/; max-age=0";
    router.push("/login");
  }

  const speciesEmoji: Record<string, string> = { dog: "Perro", cat: "Gato", bird: "Ave", rabbit: "Conejo", other: "Mascota" };
  const speciesNames: Record<string, string> = { dog: "Perro", cat: "Gato", bird: "Ave", rabbit: "Conejo", other: "Otro" };
  const sexNames: Record<string, string> = { male: "Macho", female: "Hembra" };
  const statusConfig: Record<string, { color: string; text: string; emoji: string }> = {
    home: { color: "bg-green-100 text-green-700", text: "En casa", emoji: "" },
    lost: { color: "bg-red-100 text-red-700", text: "PERDIDO", emoji: "" },
  };

  function getSpeciesName(species: string): string { return speciesNames[species] || species; }
  function getSexName(sex: string): string { return sexNames[sex] || sex; }

  function getVaccineStatus(nextDue: string): { color: string; text: string; emoji: string } {
    if (!nextDue) return { color: "bg-gray-100 text-gray-700", text: "Sin proxima dosis", emoji: "" };
    const nextDate = new Date(nextDue);
    const today = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { color: "bg-red-100 text-red-700", text: `Vencida (${Math.abs(diffDays)} dias)`, emoji: "" };
    if (diffDays <= 30) return { color: "bg-yellow-100 text-yellow-700", text: `Proxima (${diffDays} dias)`, emoji: "" };
    return { color: "bg-green-100 text-green-700", text: `Al dia (${diffDays} dias)`, emoji: "" };
  }

  const allergyTypeLabels: Record<string, string> = {
    food: "Alimento",
    medication: "Medicamento",
    environmental: "Ambiental",
  };

  const severityConfig: Record<string, { color: string; emoji: string }> = {
    mild: { color: "bg-yellow-100 text-yellow-800", emoji: "" },
    moderate: { color: "bg-orange-100 text-orange-800", emoji: "" },
    severe: { color: "bg-red-100 text-red-800", emoji: "" },
  };

  const severityLabels: Record<string, string> = {
    mild: "Leve",
    moderate: "Moderada",
    severe: "Grave",
  };

  const conditionTypeLabels: Record<string, string> = {
    surgery: "Cirugia",
    illness: "Enfermedad",
    injury: "Lesion",
    diagnosis: "Diagnostico",
    other: "Otro",
  };

  const dewormingTypeLabels: Record<string, string> = {
    internal: "Interna",
    external: "Externa",
    both: "Interna + Externa",
  };

  function getNextDewormingStatus(nextDate: string): { color: string; text: string; emoji: string } {
    if (!nextDate) return { color: "bg-gray-100 text-gray-700", text: "Sin proxima dosis", emoji: "" };
    const next = new Date(nextDate);
    const today = new Date();
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { color: "bg-red-100 text-red-700", text: `Vencida (${Math.abs(diffDays)} dias)`, emoji: "" };
    if (diffDays <= 30) return { color: "bg-yellow-100 text-yellow-700", text: `Proxima (${diffDays} dias)`, emoji: "" };
    return { color: "bg-green-100 text-green-700", text: `Al dia (${diffDays} dias)`, emoji: "" };
  }

  function getWeightTrend(current: number, previous: number): { text: string; color: string } {
    const diff = current - previous;
    if (diff > 0) return { text: `+${diff.toFixed(1)} kg`, color: "text-red-600" };
    if (diff < 0) return { text: `${diff.toFixed(1)} kg`, color: "text-green-600" };
    return { text: "0 kg", color: "text-gray-600" };
  }

  const chartThemes: Record<string, { primary: string; secondary: string; gradient: [string, string]; bg: string }> = {
    xpipet: { primary: "#9333ea", secondary: "#ec4899", gradient: ["#9333ea", "#ec4899"], bg: "#faf5ff" },
    ocean: { primary: "#0ea5e9", secondary: "#06b6d4", gradient: ["#0ea5e9", "#06b6d4"], bg: "#f0f9ff" },
    fire: { primary: "#ef4444", secondary: "#f97316", gradient: ["#ef4444", "#f97316"], bg: "#fef2f2" },
    nature: { primary: "#22c55e", secondary: "#84cc16", gradient: ["#22c55e", "#84cc16"], bg: "#f0fdf4" },
    rainbow: { primary: "#8b5cf6", secondary: "#ec4899", gradient: ["#8b5cf6", "#ec4899"], bg: "#faf5ff" },
    neon: { primary: "#a855f7", secondary: "#06b6d4", gradient: ["#a855f7", "#06b6d4"], bg: "#f8fafc" },
  };

  async function exportChartAsImage() {
    if (!chartContainerRef.current) return;
    try {
      const svgElement = chartContainerRef.current.querySelector("svg");
      if (!svgElement) {
        alert("No se pudo exportar la grafica");
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = chartThemes[chartTheme].bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 800, 500);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `peso-${selectedPetForWeight?.name || "mascota"}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      alert("Error al exportar: " + err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">XpiPet Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/reports" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Reportes</Link>
            <Link href="/profile/contact-settings" className="text-sm text-teal-600 hover:text-teal-800 font-medium">Contacto Publico</Link>
            <Link href="/profile" className="text-sm text-purple-600 hover:text-purple-800 font-medium">Mi Perfil</Link>
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600">Cerrar Sesion</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Mis Mascotas</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            {showForm ? "Cancelar" : "+ Agregar Mascota"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Nueva Mascota</h3>
            <form onSubmit={handleCreatePet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 bg-purple-50 p-4 rounded-lg border-2 border-dashed border-purple-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto de la mascota</label>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoSelect(e, "create")} disabled={uploading} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" />
                {formData.photo && !uploading && (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-purple-300 overflow-hidden shadow-lg">
                      <img src={formData.photo} alt="Vista previa" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-semibold">Foto lista</p>
                      <p className="text-xs text-gray-500">Se guardara con la mascota</p>
                    </div>
                  </div>
                )}
                {uploading && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <p className="text-sm text-purple-600 font-medium">Subiendo foto...</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
                <select required value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none">
                  <option value="">Seleccionar...</option>
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                  <option value="bird">Ave</option>
                  <option value="rabbit">Conejo</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                <input type="text" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select value={formData.sex} onChange={(e) => setFormData({ ...formData, sex: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none">
                  <option value="">Seleccionar...</option>
                  <option value="male">Macho</option>
                  <option value="female">Hembra</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Microchip</label>
                <input type="text" value={formData.microchip} onChange={(e) => setFormData({ ...formData, microchip: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700">Crear Mascota</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-8">Cargando mascotas...</p>
        ) : pets.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-6xl mb-4"></p>
            <p className="text-gray-600 mb-4">Aun no tienes mascotas registradas</p>
            <button onClick={() => setShowForm(true)} className="text-purple-600 font-semibold hover:underline">Agregar tu primera mascota</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet: any) => {
              const statusInfo = statusConfig[pet.status] || statusConfig.home;
              const isLost = pet.status === "lost";
              return (
                <div key={pet.id} className={`bg-white rounded-xl shadow p-6 ${isLost ? "border-2 border-red-500" : ""}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{speciesEmoji[pet.species] || "Mascota"} {pet.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${statusInfo.color}`}>{statusInfo.emoji} {statusInfo.text}</span>
                  </div>
                  
                  <div className="mb-4 flex justify-center">
                    {pet.photo_url ? (
                      <div className="w-32 h-32 rounded-full border-4 border-purple-100 shadow-md overflow-hidden">
                        <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl border-4 border-gray-100">
                        {speciesEmoji[pet.species] || "Mascota"}
                      </div>
                    )}
                  </div>

                  {isLost && pet.lost_report && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3 text-sm">
                      <strong>Reporte:</strong> {pet.lost_report}
                    </div>
                  )}
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Especie: {getSpeciesName(pet.species)}</p>
                    {pet.breed && <p>Raza: {pet.breed}</p>}
                    {pet.color && <p>Color: {pet.color}</p>}
                    {pet.sex && <p>Sexo: {getSexName(pet.sex)}</p>}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-3">Codigo QR: <span className="font-mono font-bold text-purple-600">{pet.public_id}</span></p>
                    <div className="flex gap-2 mb-2">
                      <a href={`/pets/${pet.public_id}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-pink-600 text-white text-sm py-2 rounded hover:bg-pink-700 text-center">Ver Perfil</a>
                      <button onClick={() => setSelectedPet(pet)} className="flex-1 bg-purple-600 text-white text-sm py-2 rounded hover:bg-purple-700">Ver QR</button>
                      <button onClick={() => openEditModal(pet)} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700">Editar</button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => openMap(pet)} className="flex-1 bg-green-600 text-white text-sm py-2 rounded hover:bg-green-700">Ver Ubicacion</button>
                      <button onClick={() => loadLocationHistory(pet)} className="flex-1 bg-indigo-600 text-white text-sm py-2 rounded hover:bg-indigo-700">Ver Historial</button>
                    </div>
                    <button onClick={() => openVaccines(pet)} className="w-full bg-teal-600 text-white text-sm py-2 rounded hover:bg-teal-700 mb-2 flex items-center justify-center gap-2">Vacunas y Salud</button>
                    <button onClick={() => openVet(pet)} className="w-full bg-orange-500 text-white text-sm py-2 rounded hover:bg-orange-600 mb-2 flex items-center justify-center gap-2 font-semibold">Veterinario</button>
                    <button onClick={() => openAllergies(pet)} className="w-full bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 mb-2 flex items-center justify-center gap-2 font-semibold">Alergias</button>
                    <button onClick={() => openMedications(pet)} className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 mb-2 flex items-center justify-center gap-2 font-semibold">Medicacion</button>
                    <button onClick={() => openMedicalHistory(pet)} className="w-full bg-purple-600 text-white text-sm py-2 rounded hover:bg-purple-700 mb-2 flex items-center justify-center gap-2 font-semibold">Historial Medico</button>
                    <button onClick={() => openDeworming(pet)} className="w-full bg-emerald-600 text-white text-sm py-2 rounded hover:bg-emerald-700 mb-2 flex items-center justify-center gap-2 font-semibold">Desparasitaciones</button>
                    <button onClick={() => openWeight(pet)} className="w-full bg-amber-500 text-white text-sm py-2 rounded hover:bg-amber-600 mb-2 flex items-center justify-center gap-2 font-semibold">Control de Peso</button>
                    <button onClick={() => openAlertsPanel(pet)} className="w-full bg-slate-800 text-white text-sm py-2 rounded hover:bg-slate-900 mb-2 flex items-center justify-center gap-2 font-semibold"> Centro de Alertas</button>
                    <a href={`/dashboard/pets/${pet.id}/diary`} className="w-full bg-amber-500 text-white text-sm py-2 rounded hover:bg-amber-600 mb-2 flex items-center justify-center gap-2 font-semibold">Diario de Vida</a>
                    {isLost ? (
                      <button onClick={() => reportFound(pet.id)} className="w-full bg-green-600 text-white text-sm py-2 rounded hover:bg-green-700 mb-2">Marcar como Encontrado</button>
                    ) : (
                      <button onClick={() => setShowLostModal(pet)} className="w-full bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 mb-2">Reportar Perdido</button>
                    )}
                    <button onClick={() => handleDeletePet(pet.id)} className="w-full bg-red-100 text-red-600 text-sm py-2 rounded hover:bg-red-200">Eliminar</button>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">GPS:</span>
                        <button onClick={() => toggleGPS(pet, pet.gps_enabled === 0)} className={`px-3 py-1 rounded text-xs font-semibold ${pet.gps_enabled === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {pet.gps_enabled === 1 ? "Activado" : "Desactivado"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showCropModal && cropImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Ajusta la foto</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">Mueve y haz zoom para seleccionar la parte que quieres mostrar</p>
            <div className="relative w-full h-80 mb-6 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Zoom: {Math.round(zoom * 100)}%</label>
              <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCropSave} disabled={uploading} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400">
                {uploading ? "Subiendo..." : "Guardar seleccion"}
              </button>
              <button onClick={() => { setShowCropModal(false); setCropImage(""); setCroppedAreaPixels(null); }} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{speciesEmoji[selectedPet.species] || "Mascota"} {selectedPet.name}</h3>
              <p className="text-sm text-gray-500 mb-6">Codigo: <span className="font-mono font-bold text-purple-600">{selectedPet.public_id}</span></p>
              <div className="bg-white p-4 rounded-lg border-2 border-purple-200 inline-block mb-4">
                <QRCodeSVG id={`qr-${selectedPet.public_id}`} value={`${typeof window !== 'undefined' ? window.location.origin : ''}/pets/${selectedPet.public_id}`} size={256} level="H" includeMargin={true} />
              </div>
              <p className="text-xs text-gray-500 mb-6">Escanea este codigo para ver el perfil de {selectedPet.name}</p>
              <div className="flex gap-3">
                <button onClick={downloadQR} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold">Descargar QR</button>
                <button onClick={() => setSelectedPet(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Editar Mascota</h3>
              <p className="text-sm text-gray-500">Modifica la informacion de {editingPet.name}</p>
            </div>
            <form onSubmit={handleUpdatePet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border-2 border-dashed border-blue-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cambiar foto</label>
                {formData.photo ? (
                  <div className="mb-3 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-blue-300 overflow-hidden shadow-lg">
                      <img src={formData.photo} alt="Foto actual" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Foto actual</p>
                      <p className="text-xs text-gray-500">Sube una nueva para reemplazarla</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-300 bg-gray-100 flex items-center justify-center text-3xl">
                      {speciesEmoji[formData.species] || "Mascota"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Sin foto</p>
                      <p className="text-xs text-gray-500">Selecciona una imagen para agregarla</p>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handlePhotoSelect(e, "edit", editingPet.id)} disabled={uploading} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
                {uploading && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-600 font-medium">Subiendo...</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
                <select required value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none">
                  <option value="">Seleccionar...</option>
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                  <option value="bird">Ave</option>
                  <option value="rabbit">Conejo</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                <input type="text" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select value={formData.sex} onChange={(e) => setFormData({ ...formData, sex: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none">
                  <option value="">Seleccionar...</option>
                  <option value="male">Macho</option>
                  <option value="female">Hembra</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Microchip</label>
                <input type="text" value={formData.microchip} onChange={(e) => setFormData({ ...formData, microchip: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" />
              </div>
              <div className="md:col-span-2 flex gap-3 mt-4">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700">Guardar Cambios</button>
                <button type="button" onClick={closeEditModal} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMap && !showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Ubicacion de {showMap.name}</h3>
              <p className="text-sm text-gray-500">Ultima actualizacion: {showMap.last_location_updated_at || "Nunca"}</p>
            </div>
            <div className="border-2 border-purple-200 rounded-lg overflow-hidden mb-6">
              {userLocation ? (
                <iframe width="100%" height="400" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.01},${userLocation.lat - 0.01},${userLocation.lng + 0.01},${userLocation.lat + 0.01}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`} title="Mapa de ubicacion" />
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-100"><p className="text-gray-500">Cargando mapa...</p></div>
              )}
            </div>
            {userLocation && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-purple-800"><strong>Coordenadas:</strong><br />Lat: {userLocation.lat.toFixed(6)}<br />Lng: {userLocation.lng.toFixed(6)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { getCurrentPosition(); if (showMap && userLocation) updatePetLocation(showMap.id, userLocation.lat, userLocation.lng); }} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-semibold">Actualizar Ubicacion</button>
              <button onClick={() => setShowMap(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Historial de Ubicaciones - {showMap?.name || "Mascota"}</h3>
              <p className="text-sm text-gray-500">Ultimas {locationHistory.length} ubicaciones registradas</p>
            </div>
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Ubicaciones registradas:</h4>
              {locationHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay ubicaciones registradas.</p>
              ) : (
                locationHistory.map((loc: any, index: number) => {
                  const lat = parseFloat(loc.latitude || loc.lat);
                  const lng = parseFloat(loc.longitude || loc.lng);
                  const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
                  const isLoading = loadingAddresses[coordKey];
                  const address = addressCache[coordKey];
                  return (
                    <div key={loc.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-purple-700">Ubicacion #{locationHistory.length - index}</p>
                          <p className="text-xs text-gray-600 font-mono mt-1">Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{new Date(loc.created_at || loc.recorded_at).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                          {loc.accuracy_meters && <p className="text-xs text-gray-500">Precision: {loc.accuracy_meters}m</p>}
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-purple-100">
                        {isLoading ? (
                          <p className="text-xs text-purple-600 italic">Obteniendo direccion...</p>
                        ) : address ? (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Direccion aproximada:</p>
                            <p className="text-sm font-semibold text-gray-800">{address}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Direccion no disponible</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowHistory(false); setAddressCache({}); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showVaccines && selectedPetForVaccines && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Vacunas y Salud - {selectedPetForVaccines.name}</h3>
                <p className="text-sm text-gray-500">{vaccinations.length} registro(s) de salud</p>
              </div>
              <button onClick={() => { setShowVaccines(false); setShowAddVaccine(false); }} className="text-gray-500 hover:text-gray-700 text-2xl">X</button>
            </div>
            {!showAddVaccine ? (
              <>
                {vaccinations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💉</div>
                    <p className="text-gray-600 mb-4">No hay registros de vacunas</p>
                    <button onClick={() => setShowAddVaccine(true)} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-semibold">+ Agregar primera vacuna</button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {vaccinations.map((vac: any) => {
                      const status = getVaccineStatus(vac.next_due);
                      return (
                        <div key={vac.id} className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-teal-900 text-lg">{vac.vaccine_name}</h4>
                              <p className="text-xs text-gray-600">Aplicada: {new Date(vac.date_administered).toLocaleDateString('es-CO')}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.emoji} {status.text}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mt-3">
                            {vac.next_due && (<div><p className="text-xs text-gray-500">Proxima dosis:</p><p className="font-semibold">{new Date(vac.next_due).toLocaleDateString('es-CO')}</p></div>)}
                            {vac.vet_name && (<div><p className="text-xs text-gray-500">Veterinario:</p><p className="font-semibold">{vac.vet_name}</p></div>)}
                            {vac.lot_number && (<div><p className="text-xs text-gray-500">Lote:</p><p className="font-mono text-xs">{vac.lot_number}</p></div>)}
                          </div>
                          <button onClick={() => handleDeleteVaccine(vac.id)} className="mt-3 text-xs text-red-600 hover:text-red-700 hover:underline">Eliminar registro</button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button onClick={() => setShowAddVaccine(true)} className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 font-semibold flex items-center justify-center gap-2">+ Agregar nueva vacuna</button>
              </>
            ) : (
              <form onSubmit={handleAddVaccine} className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Registrar nueva vacuna para {selectedPetForVaccines.name}</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la vacuna *</label>
                  <select required value={vaccineForm.vaccine_name} onChange={(e) => setVaccineForm({ ...vaccineForm, vaccine_name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-600 focus:outline-none">
                    <option value="">Seleccionar vacuna...</option>
                    <option value="Rabia">Rabia</option>
                    <option value="Polivalente (Sextuple)">Polivalente (Sextuple)</option>
                    <option value="Parvovirus">Parvovirus</option>
                    <option value="Moquillo">Moquillo</option>
                    <option value="Hepatitis">Hepatitis</option>
                    <option value="Leptospirosis">Leptospirosis</option>
                    <option value="Desparasitacion interna">Desparasitacion interna</option>
                    <option value="Desparasitacion externa">Desparasitacion externa</option>
                    <option value="Triple Felina">Triple Felina (gatos)</option>
                    <option value="Leucemia Felina">Leucemia Felina (gatos)</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de aplicacion *</label>
                    <input type="date" required value={vaccineForm.date_administered} onChange={(e) => setVaccineForm({ ...vaccineForm, date_administered: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proxima dosis</label>
                    <input type="date" value={vaccineForm.next_due} onChange={(e) => setVaccineForm({ ...vaccineForm, next_due: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-600 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario</label>
                  <input type="text" value={vaccineForm.vet_name} onChange={(e) => setVaccineForm({ ...vaccineForm, vet_name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-600 focus:outline-none" placeholder="Dr. Juan Perez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero de lote</label>
                  <input type="text" value={vaccineForm.lot_number} onChange={(e) => setVaccineForm({ ...vaccineForm, lot_number: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-teal-600 focus:outline-none" placeholder="LOT-12345" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 font-semibold">Guardar vacuna</button>
                  <button type="button" onClick={() => setShowAddVaccine(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showVet && selectedPetForVet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-lg w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Veterinario de {selectedPetForVet.name}</h3>
                <p className="text-sm text-gray-500">Datos del veterinario de cabecera</p>
              </div>
              <button onClick={() => setShowVet(false)} className="text-gray-500 hover:text-gray-700 text-2xl">X</button>
            </div>
            {loadingVet ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
                <p className="text-gray-600">Cargando...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveVet} className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800"><strong>Tip:</strong> Este es el veterinario principal de tu mascota.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del veterinario *</label>
                  <input type="text" required value={vetData.vetName} onChange={(e) => setVetData({ ...vetData, vetName: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-orange-500 focus:outline-none" placeholder="Dr. Juan Perez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la clinica</label>
                  <input type="text" value={vetData.clinicName} onChange={(e) => setVetData({ ...vetData, clinicName: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-orange-500 focus:outline-none" placeholder="Clinica Veterinaria San Roque" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                  <input type="tel" value={vetData.phone} onChange={(e) => setVetData({ ...vetData, phone: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-orange-500 focus:outline-none" placeholder="300 123 4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Direccion</label>
                  <input type="text" value={vetData.address} onChange={(e) => setVetData({ ...vetData, address: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-orange-500 focus:outline-none" placeholder="Calle 45 #12-34, Bogota" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas (horarios, especialidad, etc.)</label>
                  <textarea rows={3} value={vetData.notes} onChange={(e) => setVetData({ ...vetData, notes: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-orange-500 focus:outline-none" placeholder="Ej: Atiende de lunes a sabado de 8am a 6pm. Especialista en cardiologia." />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={vetIsPublic} onChange={(e) => setVetIsPublic(e.target.checked)} className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-900">Mostrar en perfil publico</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {vetIsPublic ? "Cualquier persona que escanee el QR podra ver los datos de este veterinario." : "Esta informacion sera privada, solo visible para ti en el dashboard."}
                      </p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="submit" className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-semibold">Guardar</button>
                  <button type="button" onClick={() => setShowVet(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
                {vetData.vetName && (
                  <button type="button" onClick={handleDeleteVet} className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 text-sm font-semibold">
                    Eliminar veterinario registrado
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {showAllergies && selectedPetForAllergies && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Alergias de {selectedPetForAllergies.name}</h3>
                <p className="text-sm text-gray-500">{allergies.length} alergia(s) registrada(s)</p>
              </div>
              <button onClick={() => { setShowAllergies(false); setShowAddAllergy(false); }} className="text-gray-500 hover:text-gray-700 text-2xl">X</button>
            </div>
            {!showAddAllergy ? (
              <>
                {allergies.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-gray-600 mb-4">No hay alergias registradas</p>
                    <p className="text-sm text-gray-500 mb-6">Registrar alergias ayuda a prevenir emergencias si tu mascota se pierde.</p>
                    <button onClick={() => setShowAddAllergy(true)} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold">+ Agregar primera alergia</button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {allergies.map((allergy: any) => {
                      const severity = severityConfig[allergy.severity] || severityConfig.moderate;
                      return (
                        <div key={allergy.id} className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                  {allergyTypeLabels[allergy.allergy_type] || allergy.allergy_type}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severity.color}`}>
                                  {severity.emoji} {severityLabels[allergy.severity] || allergy.severity}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${allergy.public === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                  {allergy.public === 1 ? "Publico" : "Privado"}
                                </span>
                              </div>
                              <h4 className="font-bold text-red-900 text-lg">{allergy.allergen}</h4>
                            </div>
                          </div>
                          {allergy.symptoms && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 font-semibold">Sintomas:</p>
                              <p className="text-sm text-gray-700">{allergy.symptoms}</p>
                            </div>
                          )}
                          {allergy.treatment && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 font-semibold">Que hacer:</p>
                              <p className="text-sm text-gray-700">{allergy.treatment}</p>
                            </div>
                          )}
                          <div className="flex gap-2 mt-3 pt-3 border-t border-red-100">
                            <button onClick={() => handleToggleAllergyPublic(allergy.id)} className={`px-3 py-1 rounded text-xs font-semibold ${allergy.public === 1 ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                              {allergy.public === 1 ? "Publico" : "Privado"}
                            </button>
                            <button onClick={() => handleDeleteAllergy(allergy.id)} className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200">
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button onClick={() => setShowAddAllergy(true)} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2">+ Agregar nueva alergia</button>
              </>
            ) : (
              <form onSubmit={handleAddAllergy} className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Registrar nueva alergia para {selectedPetForAllergies.name}</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800"><strong>Importante:</strong> Esta informacion puede salvar la vida de tu mascota en emergencias.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de alergia *</label>
                  <select required value={allergyForm.allergyType} onChange={(e) => setAllergyForm({ ...allergyForm, allergyType: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-600 focus:outline-none">
                    <option value="food">Alimento</option>
                    <option value="medication">Medicamento</option>
                    <option value="environmental">Ambiental</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alergeno (que le da alergia) *</label>
                  <input type="text" required value={allergyForm.allergen} onChange={(e) => setAllergyForm({ ...allergyForm, allergen: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-600 focus:outline-none" placeholder="Ej: Pollo, Penicilina, Polvo, Acaros..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gravedad *</label>
                  <select required value={allergyForm.severity} onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-600 focus:outline-none">
                    <option value="mild">Leve (molestia, picazon)</option>
                    <option value="moderate">Moderada (vomito, diarrea)</option>
                    <option value="severe">Grave (shock anafilactico, riesgo de muerte)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sintomas</label>
                  <textarea rows={2} value={allergyForm.symptoms} onChange={(e) => setAllergyForm({ ...allergyForm, symptoms: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-600 focus:outline-none" placeholder="Ej: Vomito, picazon en la piel, hinchazon..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Que hacer si tiene reaccion</label>
                  <textarea rows={2} value={allergyForm.treatment} onChange={(e) => setAllergyForm({ ...allergyForm, treatment: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-600 focus:outline-none" placeholder="Ej: Suspender alimento, llevar al veterinario de inmediato, aplicar antihistaminico..." />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={allergyForm.isPublic} onChange={(e) => setAllergyForm({ ...allergyForm, isPublic: e.target.checked })} className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-900">Mostrar en perfil publico</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {allergyForm.isPublic ? "Cualquier persona que escanee el QR podra ver esta alergia (recomendado para emergencias)." : "Esta informacion sera privada, solo visible para ti en el dashboard."}
                      </p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold">Guardar alergia</button>
                  <button type="button" onClick={() => setShowAddAllergy(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showMedications && selectedPetForMedications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Medicacion de {selectedPetForMedications.name}</h3>
                <p className="text-sm text-gray-500">{medications.length} medicamento(s) registrado(s)</p>
              </div>
              <button onClick={() => { setShowMedications(false); setShowAddMedication(false); }} className="text-gray-500 hover:text-gray-700 text-2xl">X</button>
            </div>
            {!showAddMedication ? (
              <>
                {medications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💊</div>
                    <p className="text-gray-600 mb-4">No hay medicamentos registrados</p>
                    <p className="text-sm text-gray-500 mb-6">Registrar la medicacion actual ayuda en caso de emergencias o cuidados temporales.</p>
                    <button onClick={() => setShowAddMedication(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">+ Agregar primer medicamento</button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {medications.map((med: any) => {
                      return (
                        <div key={med.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${med.public === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                  {med.public === 1 ? "Publico" : "Privado"}
                                </span>
                                {med.frequency && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                    {med.frequency}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-blue-900 text-lg">{med.medication_name}</h4>
                              <p className="text-sm text-gray-700 font-semibold">Dosis: {med.dosage}</p>
                            </div>
                          </div>
                          {med.schedule && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 font-semibold">Horario:</p>
                              <p className="text-sm text-gray-700">{med.schedule}</p>
                            </div>
                          )}
                          {med.reason && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 font-semibold">Motivo:</p>
                              <p className="text-sm text-gray-700">{med.reason}</p>
                            </div>
                          )}
                          {med.prescribed_by && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 font-semibold">Recetado por:</p>
                              <p className="text-sm text-gray-700">{med.prescribed_by}</p>
                            </div>
                          )}
                          <div className="flex gap-2 mt-3 pt-3 border-t border-blue-100">
                            <button onClick={() => handleToggleMedicationPublic(med.id)} className={`px-3 py-1 rounded text-xs font-semibold ${med.public === 1 ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                              {med.public === 1 ? "Publico" : "Privado"}
                            </button>
                            <button onClick={() => handleDeleteMedication(med.id)} className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200">
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button onClick={() => setShowAddMedication(true)} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">+ Agregar nuevo medicamento</button>
              </>
            ) : (
              <form onSubmit={handleAddMedication} className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Registrar nuevo medicamento para {selectedPetForMedications.name}</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800"><strong>Importante:</strong> Esta informacion es vital si alguien debe cuidar a tu mascota temporalmente.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del medicamento *</label>
                    <input type="text" required value={medicationForm.medicationName} onChange={(e) => setMedicationForm({ ...medicationForm, medicationName: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej: Meloxicam, Prednisona..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosis *</label>
                    <input type="text" required value={medicationForm.dosage} onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej: 5mg, 10ml, 1 pastilla..." />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia *</label>
                    <select required value={medicationForm.frequency} onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none">
                      <option value="Diaria">Diaria</option>
                      <option value="Cada 8 horas">Cada 8 horas</option>
                      <option value="Cada 12 horas">Cada 12 horas</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Segun indicacion">Segun indicacion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horario especifico</label>
                    <input type="text" value={medicationForm.schedule} onChange={(e) => setMedicationForm({ ...medicationForm, schedule: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej: 8:00 AM y 8:00 PM" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Condicion</label>
                  <input type="text" value={medicationForm.reason} onChange={(e) => setMedicationForm({ ...medicationForm, reason: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej: Artritis, Alergia cronica, Epilepsia..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recetado por</label>
                  <input type="text" value={medicationForm.prescribedBy} onChange={(e) => setMedicationForm({ ...medicationForm, prescribedBy: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" placeholder="Ej: Dr. Luis Guillermo Estrada" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                    <input type="date" value={medicationForm.startDate} onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin (si aplica)</label>
                    <input type="date" value={medicationForm.endDate} onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={medicationForm.isPublic} onChange={(e) => setMedicationForm({ ...medicationForm, isPublic: e.target.checked })} className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-900">Mostrar en perfil publico</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {medicationForm.isPublic ? "Cualquier persona que escanee el QR podra ver esta medicacion (recomendado para emergencias)." : "Esta informacion sera privada, solo visible para ti en el dashboard."}
                      </p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">Guardar medicamento</button>
                  <button type="button" onClick={() => setShowAddMedication(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showMedicalHistory && selectedPetForMedicalHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Historial Medico de {selectedPetForMedicalHistory.name}</h3>
                <p className="text-sm text-gray-500">{medicalHistory.length} evento(s) registrado(s)</p>
              </div>
              <button onClick={() => { setShowMedicalHistory(false); setShowAddMedicalEvent(false); }} className="text-gray-500 hover:text-gray-700 text-2xl">X</button>
            </div>
            {!showAddMedicalEvent ? (
              <>
                {medicalHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4"></div>
                    <p className="text-gray-600 mb-4">No hay historial medico registrado</p>
                    <button onClick={() => setShowAddMedicalEvent(true)} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-semibold">+ Agregar primer evento</button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {medicalHistory.map((event: any) => {
                      return (
                        <div key={event.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                                  {conditionTypeLabels[event.condition_type] || event.condition_type}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${event.public === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                  {event.public === 1 ? "Publico" : "Privado"}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${event.recovered === 1 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                  {event.recovered === 1 ? "Recuperado" : "En tratamiento"}
                                </span>
                              </div>
                              <h4 className="font-bold text-purple-900 text-lg">{event.condition}</h4>
                              <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString('es-CO')}</p>
                            </div>
                          </div>
                          {event.description && (
                            <div className="mt-2"><p className="text-xs text-gray-500 font-semibold">Descripcion:</p><p className="text-sm text-gray-700">{event.description}</p></div>
                          )}
                          {event.treatment && (
                            <div className="mt-2"><p className="text-xs text-gray-500 font-semibold">Tratamiento:</p><p className="text-sm text-gray-700">{event.treatment}</p></div>
                          )}
                          {event.vet_name && (
                            <div className="mt-2"><p className="text-xs text-gray-500 font-semibold">Atendido por:</p><p className="text-sm text-gray-700">{event.vet_name}</p></div>
                          )}
                          <div className="flex gap-2 mt-3 pt-3 border-t border-purple-100">
                            <button onClick={() => handleToggleMedicalHistoryPublic(event.id)} className={`px-3 py-1 rounded text-xs font-semibold ${event.public === 1 ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                              {event.public === 1 ? "Publico" : "Privado"}
                            </button>
                            <button onClick={() => handleDeleteMedicalEvent(event.id)} className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200">
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button onClick={() => setShowAddMedicalEvent(true)} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center gap-2">+ Agregar nuevo evento</button>
              </>
            ) : (
              <form onSubmit={handleAddMedicalEvent} className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Registrar evento medico para {selectedPetForMedicalHistory.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condicion / Diagnostico *</label>
                    <input type="text" required value={medicalHistoryForm.condition} onChange={(e) => setMedicalHistoryForm({ ...medicalHistoryForm, condition: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" placeholder="Ej: Fractura de pata, Parvovirus..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de evento *</label>
                    <select required value={medicalHistoryForm.conditionType} onChange={(e) => setMedicalHistoryForm({ ...medicalHistoryForm, conditionType: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none">
                      <option value="surgery">Cirugia</option>
                      <option value="illness">Enfermedad</option>
                      <option value="injury">Lesion</option>
                      <option value="diagnosis">Diagnostico</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del evento *</label>
                    <input type="date" required value={medicalHistoryForm.date} onChange={(e) => setMedicalHistoryForm({ ...medicalHistoryForm, date: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Se recupero?</label>
                    <select value={medicalHistoryForm.recovered ? "true" : "false"} onChange={(e) => setMedicalHistoryForm({ ...medicalHistoryForm, recovered: e.target.value === "true" })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none">
                      <option value="true">Si, se recupero</option>
                      <option value="false">No, en tratamiento/cronico</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion detallada</label>
                  <textarea rows={2} value={medicalHistoryForm.description} onChange={(e) => setMedicalHistoryForm({ ...medicalHistoryForm, description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" placeholder="Detalles del evento..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento aplicado</label>
                  <textarea rows={2} value={medicalHistoryForm.treatment} onChange={(e) => setMedicalHistoryForm({ ...medicalHistoryForm, treatment: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" placeholder="Cirugia, medicamentos, reposo..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario que atendio</label>
                    <input type="text" value={medicalHistoryForm.vetName} onChange={(e) => setMedicalHistoryForm({ ...medicalHistoryForm, vetName: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" placeholder="Dr. Juan Perez" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Costo (opcional)</label>
                    <input type="text" value={medicalHistoryForm.cost} onChange={(e) => setMedicalHistoryForm({ ...medicalHistoryForm, cost: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none" placeholder="$ 450.000" />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={medicalHistoryForm.isPublic} onChange={(e) => setMedicalHistoryForm({ ...medicalHistoryForm, isPublic: e.target.checked })} className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-900">Mostrar en perfil publico</p>
                      <p className="text-sm text-blue-700 mt-1">{medicalHistoryForm.isPublic ? "Visible para quien escanee el QR." : "Solo visible en el dashboard."}</p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="submit" className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold">Guardar evento</button>
                  <button type="button" onClick={() => setShowAddMedicalEvent(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showDeworming && selectedPetForDeworming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Desparasitaciones de {selectedPetForDeworming.name}</h3>
                <p className="text-sm text-gray-500">{dewormings.length} registro(s)</p>
              </div>
              <button onClick={() => { setShowDeworming(false); setShowAddDeworming(false); }} className="text-gray-500 hover:text-gray-700 text-2xl">X</button>
            </div>
            {!showAddDeworming ? (
              <>
                {dewormings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🦠</div>
                    <p className="text-gray-600 mb-4">No hay desparasitaciones registradas</p>
                    <button onClick={() => setShowAddDeworming(true)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-semibold">+ Agregar primera desparasitacion</button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {dewormings.map((d: any) => {
                      const nextStatus = getNextDewormingStatus(d.next_date);
                      return (
                        <div key={d.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                                  {dewormingTypeLabels[d.deworming_type] || d.deworming_type}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${nextStatus.color}`}>
                                  {nextStatus.emoji} {nextStatus.text}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.public === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                  {d.public === 1 ? "Publico" : "Privado"}
                                </span>
                              </div>
                              <h4 className="font-bold text-emerald-900 text-lg">{d.product_name}</h4>
                              <p className="text-sm text-gray-500">Aplicada: {new Date(d.date_applied).toLocaleDateString('es-CO')}</p>
                              {d.next_date && (
                                <p className="text-sm text-gray-500">Proxima: {new Date(d.next_date).toLocaleDateString('es-CO')}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 pt-3 border-t border-emerald-100">
                            <button onClick={() => handleToggleDewormingPublic(d.id)} className={`px-3 py-1 rounded text-xs font-semibold ${d.public === 1 ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                              {d.public === 1 ? "Publico" : "Privado"}
                            </button>
                            <button onClick={() => handleDeleteDeworming(d.id)} className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200">
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button onClick={() => setShowAddDeworming(true)} className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold flex items-center justify-center gap-2">+ Agregar nueva desparasitacion</button>
              </>
            ) : (
              <form onSubmit={handleAddDeworming} className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Registrar desparasitacion para {selectedPetForDeworming.name}</h4>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-800">
                    <strong>Importante:</strong> Las desparasitaciones regulares son esenciales para la salud de tu mascota.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de desparasitacion *</label>
                    <select required value={dewormingForm.dewormingType} onChange={(e) => setDewormingForm({ ...dewormingForm, dewormingType: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-emerald-600 focus:outline-none">
                      <option value="internal">Interna (parasitos intestinales)</option>
                      <option value="external">Externa (pulgas, garrapatas)</option>
                      <option value="both">Interna + Externa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Producto utilizado *</label>
                    <input type="text" required value={dewormingForm.productName} onChange={(e) => setDewormingForm({ ...dewormingForm, productName: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-emerald-600 focus:outline-none" placeholder="Ej: Drontal, NexGard, Frontline..." />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de aplicacion *</label>
                    <input type="date" required value={dewormingForm.dateApplied} onChange={(e) => setDewormingForm({ ...dewormingForm, dateApplied: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-emerald-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proxima dosis (recordatorio)</label>
                    <input type="date" value={dewormingForm.nextDate} onChange={(e) => setDewormingForm({ ...dewormingForm, nextDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-emerald-600 focus:outline-none" />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={dewormingForm.isPublic} onChange={(e) => setDewormingForm({ ...dewormingForm, isPublic: e.target.checked })} className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-900">Mostrar en perfil publico</p>
                      <p className="text-sm text-blue-700 mt-1">{dewormingForm.isPublic ? "Visible para quien escanee el QR." : "Solo visible en el dashboard."}</p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold">Guardar desparasitacion</button>
                  <button type="button" onClick={() => setShowAddDeworming(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ⚖️ MODAL CONTROL DE PESO CON GRÁFICA */}
      {showWeight && selectedPetForWeight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">️ Control de Peso de {selectedPetForWeight.name}</h3>
                <p className="text-sm text-gray-500">{weights.length} registro(s)</p>
              </div>
              <button onClick={() => { setShowWeight(false); setShowAddWeight(false); }} className="text-gray-500 hover:text-gray-700 text-2xl"></button>
            </div>

            {!showAddWeight ? (
              <>
                {weights.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚖️</div>
                    <p className="text-gray-600 mb-4">No hay registros de peso</p>
                    <button onClick={() => setShowAddWeight(true)} className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 font-semibold">+ Agregar primer peso</button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                      <h4 className="font-bold text-amber-900 mb-3"> Personalizar gráfica</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2"> Tipo de gráfica:</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { type: "line", label: "📈 Línea" },
                              { type: "area", label: "🌊 Área" },
                              { type: "bar", label: "📊 Columnas" },
                              { type: "radar", label: "🎯 Radar" },
                              { type: "scatter", label: "🔵 Dispersión" },
                            ].map((opt) => (
                              <button
                                key={opt.type}
                                onClick={() => setChartType(opt.type as any)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                  chartType === opt.type
                                    ? "bg-amber-500 text-white shadow-md"
                                    : "bg-white text-gray-700 hover:bg-amber-100"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">🎨 Tema de colores:</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { theme: "xpipet", label: "🟣 XpiPet" },
                              { theme: "ocean", label: "🌊 Océano" },
                              { theme: "fire", label: "🔥 Fuego" },
                              { theme: "nature", label: "🌿 Naturaleza" },
                              { theme: "rainbow", label: "🌈 Arcoíris" },
                              { theme: "neon", label: "🌙 Neón" },
                            ].map((opt) => (
                              <button
                                key={opt.theme}
                                onClick={() => setChartTheme(opt.theme)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                  chartTheme === opt.theme
                                    ? "bg-amber-500 text-white shadow-md"
                                    : "bg-white text-gray-700 hover:bg-amber-100"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showAnimations}
                            onChange={(e) => setShowAnimations(e.target.checked)}
                            className="w-4 h-4 text-amber-500 rounded"
                          />
                          <span className="text-sm text-gray-700">✨ Animaciones</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showValues}
                            onChange={(e) => setShowValues(e.target.checked)}
                            className="w-4 h-4 text-amber-500 rounded"
                          />
                          <span className="text-sm text-gray-700"> Mostrar valores</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={viewMode === "chart"}
                            onChange={(e) => setViewMode(e.target.checked ? "chart" : "table")}
                            className="w-4 h-4 text-amber-500 rounded"
                          />
                          <span className="text-sm text-gray-700">📊 Ver gráfica</span>
                        </label>
                      </div>

                      <button
                        onClick={exportChartAsImage}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 text-sm font-semibold flex items-center gap-2"
                      >
                        💾 Exportar como imagen PNG
                      </button>
                    </div>

                    {viewMode === "chart" ? (
                      <div
                        ref={chartContainerRef}
                        className="bg-white border-2 border-amber-100 rounded-xl p-6 mb-6"
                        style={{ backgroundColor: chartThemes[chartTheme].bg }}
                      >
                        <ResponsiveContainer width="100%" height={400}>
                          {chartType === "line" ? (
                            <LineChart data={weights.slice().reverse()}>
                              <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor={chartThemes[chartTheme].gradient[0]} />
                                  <stop offset="100%" stopColor={chartThemes[chartTheme].gradient[1]} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
                              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} label={{ value: "kg", angle: -90, position: "insideLeft" }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: `2px solid ${chartThemes[chartTheme].primary}`,
                                  borderRadius: "8px",
                                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                }}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="weight"
                                name="Peso (kg)"
                                stroke={`url(#colorWeight)`}
                                strokeWidth={3}
                                dot={{ r: 6, fill: chartThemes[chartTheme].primary, stroke: "white", strokeWidth: 2 }}
                                activeDot={{ r: 8 }}
                                isAnimationActive={showAnimations}
                              />
                            </LineChart>
                          ) : chartType === "area" ? (
                            <AreaChart data={weights.slice().reverse()}>
                              <defs>
                                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={chartThemes[chartTheme].primary} stopOpacity={0.8} />
                                  <stop offset="100%" stopColor={chartThemes[chartTheme].secondary} stopOpacity={0.2} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
                              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} label={{ value: "kg", angle: -90, position: "insideLeft" }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: `2px solid ${chartThemes[chartTheme].primary}`,
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="weight"
                                name="Peso (kg)"
                                stroke={chartThemes[chartTheme].primary}
                                strokeWidth={3}
                                fill="url(#colorArea)"
                                isAnimationActive={showAnimations}
                              />
                            </AreaChart>
                          ) : chartType === "bar" ? (
                            <BarChart data={weights.slice().reverse()}>
                              <defs>
                                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={chartThemes[chartTheme].primary} />
                                  <stop offset="100%" stopColor={chartThemes[chartTheme].secondary} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
                              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} label={{ value: "kg", angle: -90, position: "insideLeft" }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: `2px solid ${chartThemes[chartTheme].primary}`,
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="weight"
                                name="Peso (kg)"
                                fill="url(#colorBar)"
                                radius={[8, 8, 0, 0]}
                                isAnimationActive={showAnimations}
                              />
                            </BarChart>
                          ) : chartType === "radar" ? (
                            <RadarChart data={weights.slice().reverse().map(w => ({ ...w, date: w.date.slice(5) }))}>
                              <PolarGrid stroke="#e5e7eb" />
                              <PolarAngleAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "11px" }} />
                              <PolarRadiusAxis stroke="#6b7280" style={{ fontSize: "11px" }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: `2px solid ${chartThemes[chartTheme].primary}`,
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Radar
                                name="Peso (kg)"
                                dataKey="weight"
                                stroke={chartThemes[chartTheme].primary}
                                fill={chartThemes[chartTheme].primary}
                                fillOpacity={0.4}
                                isAnimationActive={showAnimations}
                              />
                            </RadarChart>
                          ) : (
                            <ScatterChart>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
                              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} label={{ value: "kg", angle: -90, position: "insideLeft" }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: `2px solid ${chartThemes[chartTheme].primary}`,
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Scatter
                                name="Peso (kg)"
                                data={weights.slice().reverse()}
                                fill={chartThemes[chartTheme].primary}
                                isAnimationActive={showAnimations}
                              />
                            </ScatterChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-amber-100 rounded-xl overflow-hidden mb-6">
                        <table className="w-full">
                          <thead className="bg-amber-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-bold text-amber-900">📅 Fecha</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-amber-900">⚖️ Peso</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-amber-900"> Tendencia</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-amber-900">📝 Notas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weights.map((w: any, index: number) => {
                              const prevWeight = weights[index + 1]?.weight;
                              const trend = prevWeight ? getWeightTrend(w.weight, prevWeight) : null;
                              return (
                                <tr key={w.id} className="border-t border-amber-100 hover:bg-amber-50">
                                  <td className="px-4 py-3 text-sm">{new Date(w.date).toLocaleDateString('es-CO')}</td>
                                  <td className="px-4 py-3 text-sm font-bold text-amber-900">{w.weight} kg</td>
                                  <td className="px-4 py-3 text-sm">
                                    {trend && <span className={`font-semibold ${trend.color}`}>{trend.text}</span>}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{w.notes || "-"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      <h4 className="font-bold text-gray-800">📋 Registros detallados:</h4>
                      {weights.map((w: any, index: number) => {
                        const prevWeight = weights[index + 1]?.weight;
                        const trend = prevWeight ? getWeightTrend(w.weight, prevWeight) : null;
                        return (
                          <div key={w.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                                    📅 {new Date(w.date).toLocaleDateString('es-CO')}
                                  </span>
                                  {trend && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 ${trend.color}`}>
                                      {trend.text}
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${w.public === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                    {w.public === 1 ? "👁️ Público" : "🔒 Privado"}
                                  </span>
                                </div>
                                <h4 className="font-bold text-amber-900 text-2xl">{w.weight} kg</h4>
                                {w.notes && <p className="text-sm text-gray-600 mt-1">{w.notes}</p>}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-amber-100">
                              <button onClick={() => handleToggleWeightPublic(w.id)} className={`px-3 py-1 rounded text-xs font-semibold ${w.public === 1 ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                                {w.public === 1 ? "👁️ Público" : " Privado"}
                              </button>
                              <button onClick={() => handleDeleteWeight(w.id)} className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200">
                                🗑️ Eliminar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                <button onClick={() => setShowAddWeight(true)} className="w-full bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 font-semibold flex items-center justify-center gap-2">+ Agregar nuevo registro</button>
              </>
            ) : (
              <form onSubmit={handleAddWeight} className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Registrar peso para {selectedPetForWeight.name}</h4>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Registrar el peso regularmente ayuda a detectar problemas de salud a tiempo.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
                    <input type="number" step="0.1" required value={weightForm.weight} onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-amber-500 focus:outline-none" placeholder="Ej: 12.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                    <input type="date" required value={weightForm.date} onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                  <textarea rows={2} value={weightForm.notes} onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-amber-500 focus:outline-none" placeholder="Ej: Despues de cambio de dieta, En revision..." />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={weightForm.isPublic} onChange={(e) => setWeightForm({ ...weightForm, isPublic: e.target.checked })} className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-900">Mostrar en perfil publico</p>
                      <p className="text-sm text-blue-700 mt-1">{weightForm.isPublic ? "Visible para quien escanee el QR." : "Solo visible en el dashboard."}</p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="submit" className="flex-1 bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 font-semibold">Guardar registro</button>
                  <button type="button" onClick={() => setShowAddWeight(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🚨 MODAL CENTRO DE ALERTAS */}
      {showAlertsPanel && selectedPetForAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  🚨 Centro de Alertas: {selectedPetForAlerts.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {alertSummary.total} alerta(s) detectada(s) por el sistema inteligente
                </p>
              </div>
              <button onClick={() => setShowAlertsPanel(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✖</button>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <label className="block text-sm font-semibold text-blue-900 mb-2">📧 Email para enviar recordatorio:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 border border-blue-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                💡 <strong>Nota:</strong> En modo prueba, Resend solo envía al email registrado en tu cuenta de Resend.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{alertSummary.critical}</p>
                <p className="text-xs text-red-700 font-semibold">Críticas</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">{alertSummary.warning}</p>
                <p className="text-xs text-amber-700 font-semibold">Advertencias</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{alertSummary.info}</p>
                <p className="text-xs text-blue-700 font-semibold">Informativas</p>
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-xl font-bold text-gray-800 mb-2">¡Todo en orden!</p>
                <p className="text-gray-600">No hay alertas activas para {selectedPetForAlerts.name}. ¡Sigue así!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alertData: any) => {
                  const colors: Record<string, string> = {
                    critical: "bg-red-50 border-red-300 text-red-900",
                    warning: "bg-amber-50 border-amber-300 text-amber-900",
                    info: "bg-blue-50 border-blue-300 text-blue-900",
                  };
                  const badgeColors: Record<string, string> = {
                    critical: "bg-red-200 text-red-800",
                    warning: "bg-amber-200 text-amber-800",
                    info: "bg-blue-200 text-blue-800",
                  };
                  return (
                    <div key={alertData.id} className={`border-2 rounded-lg p-4 ${colors[alertData.severity] || "bg-gray-50 border-gray-300"}`}>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{alertData.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-base">{alertData.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${badgeColors[alertData.severity] || "bg-gray-200"}`}>
                              {alertData.severity}
                            </span>
                          </div>
                          <p className="text-sm mt-1 opacity-90">{alertData.message}</p>
                          <div className="flex gap-3 mt-3">
                            <button 
                              onClick={() => handleAlertAction(alertData)} 
                              className="text-xs font-bold underline hover:no-underline cursor-pointer text-gray-700"
                            >
                              {alertData.action} →
                            </button>
                            <button 
                              onClick={() => handleSendReminder(alertData)}
                              disabled={sendingReminder || !reminderEmail.trim()}
                              className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {sendingReminder ? "Enviando..." : "📧 Enviar recordatorio"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowAlertsPanel(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Reportar Mascota Perdida</h3>
              <p className="text-sm text-gray-600">Estas a punto de reportar a <strong>{showLostModal.name}</strong> como perdido</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripcion de lo sucedido *</label>
              <textarea value={lostReport} onChange={(e) => setLostReport(e.target.value)} placeholder="Ej: Se escapo del parque ayer por la tarde..." rows={4} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-600 focus:outline-none" />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800"><strong>Importante:</strong> Esta informacion sera visible publicamente para ayudar a encontrar a tu mascota.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { if (lostReport.trim()) reportLost(showLostModal.id, lostReport); else alert("Por favor describe lo sucedido"); }} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700">Reportar Perdido</button>
              <button onClick={() => { setShowLostModal(null); setLostReport(""); }} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <PWAInstallButton />
    </div>
  );
}