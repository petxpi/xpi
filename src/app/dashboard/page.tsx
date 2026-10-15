"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Cropper from "react-easy-crop";

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

  // 🩺 ESTADOS VETERINARIO
  const [showVet, setShowVet] = useState(false);
  const [selectedPetForVet, setSelectedPetForVet] = useState<any>(null);
  const [vetData, setVetData] = useState({ vetName: "", clinicName: "", phone: "", address: "", notes: "" });
  const [loadingVet, setLoadingVet] = useState(false);
  const [vetIsPublic, setVetIsPublic] = useState(true);

  // ⚠️ ESTADOS ALERGIAS
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

  // 💊 ESTADOS MEDICACIÓN (NUEVO)
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
      alert(`✅ Mascota creada! Código: ${data.publicId}`);
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
      alert("✅ Mascota actualizada!");
      setEditingPet(null);
      setFormData({ name: "", species: "", breed: "", color: "", sex: "", microchip: "", photo: "" });
      loadPets();
    } catch (err: any) { setError(err.message); }
  }

  async function handleDeletePet(petId: string) {
    if (!confirm("¿Estás seguro de eliminar esta mascota?")) return;
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
      alert(" Mascota reportada como PERDIDA");
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
      alert("✅ Mascota marcada como ENCONTRADA");
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
    if (!navigator.geolocation) { alert("Tu navegador no soporta geolocalización"); return; }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (showMap) await updatePetLocation(showMap.id, latitude, longitude);
      },
      (error) => alert("Error al obtener ubicación: " + error.message)
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
      if (!response.ok) throw new Error("Error al actualizar ubicación");
      await saveLocationToHistory(petId, lat, lng);
      alert("✅ Ubicación actualizada");
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
      if (!response.ok) return "Dirección no disponible";
      const data = await response.json();
      let address = "Dirección no disponible";
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
      console.error("Error al obtener dirección:", err);
      return "Dirección no disponible";
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
      alert("✅ Vacuna registrada correctamente");
      setShowAddVaccine(false);
      setVaccineForm({ vaccine_name: "", date_administered: "", next_due: "", lot_number: "", vet_name: "" });
      await loadVaccinations(selectedPetForVaccines.id);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al registrar vacuna");
    } finally {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = "💾 Guardar vacuna"; }
    }
  }

  async function handleDeleteVaccine(vaccinationId: string) {
    if (!confirm("¿Estás seguro de eliminar esta vacuna?")) return;
    try {
      const response = await fetch(`/api/pets/${vaccinationId}/vaccinations`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar");
      if (selectedPetForVaccines) await loadVaccinations(selectedPetForVaccines.id);
    } catch (err: any) { alert(err.message || "Error al eliminar vacuna"); }
  }

  // 🩺 FUNCIONES VETERINARIO
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
      
      alert("✅ Veterinario guardado correctamente");
      setShowVet(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  async function handleDeleteVet() {
    if (!selectedPetForVet) return;
    if (!confirm("¿Eliminar el veterinario registrado?")) return;
    
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

  // ⚠️ FUNCIONES ALERGIAS
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
    if (!allergyForm.allergen.trim()) { alert("Debes indicar el alérgeno"); return; }
    
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
      alert("✅ Alergia registrada correctamente");
      setShowAddAllergy(false);
      setAllergyForm({
        allergyType: "food",
        allergen: "",
        severity: "moderate",
        symptoms: "",
        treatment: "",
        isPublic: true,
      });
      await loadAllergies(selectedPetForAllergies.id);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al registrar alergia");
    }
  }

  async function handleDeleteAllergy(allergyId: string) {
    if (!confirm("¿Estás seguro de eliminar esta alergia?")) return;
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

  // 💊 FUNCIONES MEDICACIÓN (NUEVO)
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
      alert("✅ Medicamento registrado correctamente");
      setShowAddMedication(false);
      setMedicationForm({
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
      await loadMedications(selectedPetForMedications.id);
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Error al registrar medicamento");
    }
  }

  async function handleDeleteMedication(medicationId: string) {
    if (!confirm("¿Estás seguro de eliminar este medicamento?")) return;
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

  function handleLogout() {
    document.cookie = "auth-token=; path=/; max-age=0";
    router.push("/login");
  }

  const speciesEmoji: Record<string, string> = { dog: "", cat: "🐱", bird: "🐦", rabbit: "🐰", other: "🐾" };
  const speciesNames: Record<string, string> = { dog: "Perro", cat: "Gato", bird: "Ave", rabbit: "Conejo", other: "Otro" };
  const sexNames: Record<string, string> = { male: "Macho", female: "Hembra" };
  const statusConfig: Record<string, { color: string; text: string; emoji: string }> = {
    home: { color: "bg-green-100 text-green-700", text: "En casa", emoji: "🏠" },
    lost: { color: "bg-red-100 text-red-700", text: "PERDIDO", emoji: "🚨" },
  };

  function getSpeciesName(species: string): string { return speciesNames[species] || species; }
  function getSexName(sex: string): string { return sexNames[sex] || sex; }

  function getVaccineStatus(nextDue: string): { color: string; text: string; emoji: string } {
    if (!nextDue) return { color: "bg-gray-100 text-gray-700", text: "Sin próxima dosis", emoji: "" };
    const nextDate = new Date(nextDue);
    const today = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { color: "bg-red-100 text-red-700", text: `Vencida (${Math.abs(diffDays)} días)`, emoji: "⚠️" };
    if (diffDays <= 30) return { color: "bg-yellow-100 text-yellow-700", text: `Próxima (${diffDays} días)`, emoji: "⏰" };
    return { color: "bg-green-100 text-green-700", text: `Al día (${diffDays} días)`, emoji: "✅" };
  }

  const allergyTypeLabels: Record<string, string> = {
    food: " Alimento",
    medication: "💊 Medicamento",
    environmental: "🌿 Ambiental",
  };

  const severityConfig: Record<string, { color: string; emoji: string }> = {
    mild: { color: "bg-yellow-100 text-yellow-800", emoji: "️" },
    moderate: { color: "bg-orange-100 text-orange-800", emoji: "⚠️" },
    severe: { color: "bg-red-100 text-red-800", emoji: "" },
  };

  const severityLabels: Record<string, string> = {
    mild: "Leve",
    moderate: "Moderada",
    severe: "Grave",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">🐾 XpiPet Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/reports" className="text-sm text-blue-600 hover:text-blue-800 font-medium"> Reportes</Link>
            <Link href="/profile/contact-settings" className="text-sm text-teal-600 hover:text-teal-800 font-medium">⚙️ Contacto Público</Link>
            <Link href="/profile" className="text-sm text-purple-600 hover:text-purple-800 font-medium">👤 Mi Perfil</Link>
            <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600">Cerrar Sesión</button>
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
                <label className="block text-sm font-medium text-gray-700 mb-2"> Foto de la mascota</label>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoSelect(e, "create")} disabled={uploading} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" />
                {formData.photo && !uploading && (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-purple-300 overflow-hidden shadow-lg">
                      <img src={formData.photo} alt="Vista previa" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-semibold">✅ Foto lista</p>
                      <p className="text-xs text-gray-500">Se guardará con la mascota</p>
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
                  <option value="dog">🐶 Perro</option>
                  <option value="cat">🐱 Gato</option>
                  <option value="bird">🐦 Ave</option>
                  <option value="rabbit"> Conejo</option>
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
            <p className="text-6xl mb-4">🐾</p>
            <p className="text-gray-600 mb-4">Aún no tienes mascotas registradas</p>
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
                    <h3 className="text-lg font-semibold text-gray-800">{speciesEmoji[pet.species] || "🐾"} {pet.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${statusInfo.color}`}>{statusInfo.emoji} {statusInfo.text}</span>
                  </div>
                  
                  <div className="mb-4 flex justify-center">
                    {pet.photo_url ? (
                      <div className="w-32 h-32 rounded-full border-4 border-purple-100 shadow-md overflow-hidden">
                        <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl border-4 border-gray-100">
                        {speciesEmoji[pet.species] || "🐾"}
                      </div>
                    )}
                  </div>

                  {isLost && pet.lost_report && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3 text-sm">
                      <strong>Reporte:</strong> {pet.lost_report}
                    </div>
                  )}
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>🐾 Especie: {getSpeciesName(pet.species)}</p>
                    {pet.breed && <p>🦴 Raza: {pet.breed}</p>}
                    {pet.color && <p> Color: {pet.color}</p>}
                    {pet.sex && <p>⚧ Sexo: {getSexName(pet.sex)}</p>}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-3">Código QR: <span className="font-mono font-bold text-purple-600">{pet.public_id}</span></p>
                    <div className="flex gap-2 mb-2">
                      <a href={`/pets/${pet.public_id}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-pink-600 text-white text-sm py-2 rounded hover:bg-pink-700 text-center">👁️ Ver Perfil</a>
                      <button onClick={() => setSelectedPet(pet)} className="flex-1 bg-purple-600 text-white text-sm py-2 rounded hover:bg-purple-700">📱 Ver QR</button>
                      <button onClick={() => openEditModal(pet)} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700">✏️ Editar</button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => openMap(pet)} className="flex-1 bg-green-600 text-white text-sm py-2 rounded hover:bg-green-700">📍 Ver Ubicación</button>
                      <button onClick={() => loadLocationHistory(pet)} className="flex-1 bg-indigo-600 text-white text-sm py-2 rounded hover:bg-indigo-700">📜 Ver Historial</button>
                    </div>
                    <button onClick={() => openVaccines(pet)} className="w-full bg-teal-600 text-white text-sm py-2 rounded hover:bg-teal-700 mb-2 flex items-center justify-center gap-2">💉 Vacunas y Salud</button>
                    <button onClick={() => openVet(pet)} className="w-full bg-orange-500 text-white text-sm py-2 rounded hover:bg-orange-600 mb-2 flex items-center justify-center gap-2 font-semibold">🩺 Veterinario</button>
                    <button onClick={() => openAllergies(pet)} className="w-full bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 mb-2 flex items-center justify-center gap-2 font-semibold">⚠️ Alergias</button>
                    
                    {/* 💊 NUEVO BOTÓN: MEDICACIÓN */}
                    <button onClick={() => openMedications(pet)} className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 mb-2 flex items-center justify-center gap-2 font-semibold">💊 Medicación</button>

                    <a href={`/dashboard/pets/${pet.id}/diary`} className="w-full bg-amber-500 text-white text-sm py-2 rounded hover:bg-amber-600 mb-2 flex items-center justify-center gap-2 font-semibold">📖 Diario de Vida</a>

                    {isLost ? (
                      <button onClick={() => reportFound(pet.id)} className="w-full bg-green-600 text-white text-sm py-2 rounded hover:bg-green-700 mb-2">✅ Marcar como Encontrado</button>
                    ) : (
                      <button onClick={() => setShowLostModal(pet)} className="w-full bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 mb-2">🚨 Reportar Perdido</button>
                    )}
                    <button onClick={() => handleDeletePet(pet.id)} className="w-full bg-red-100 text-red-600 text-sm py-2 rounded hover:bg-red-200">🗑️ Eliminar</button>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">GPS:</span>
                        <button onClick={() => toggleGPS(pet, pet.gps_enabled === 0)} className={`px-3 py-1 rounded text-xs font-semibold ${pet.gps_enabled === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {pet.gps_enabled === 1 ? "✅ Activado" : "❌ Desactivado"}
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

      {/* ... (Mantener todos los modales existentes: Crop, QR, Edit, Map, History, Vaccines, Vet, Allergies, Lost) ... */}
      {/* Por espacio, te indico dónde agregar el nuevo modal de Medicación. Agregalo justo ANTES del modal de "showLostModal" al final del archivo. */}

      {/* 💊 MODAL MEDICACIÓN */}
      {showMedications && selectedPetForMedications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">💊 Medicación de {selectedPetForMedications.name}</h3>
                <p className="text-sm text-gray-500">{medications.length} medicamento(s) registrado(s)</p>
              </div>
              <button onClick={() => { setShowMedications(false); setShowAddMedication(false); }} className="text-gray-500 hover:text-gray-700 text-2xl">✖</button>
            </div>

            {!showAddMedication ? (
              <>
                {medications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💊</div>
                    <p className="text-gray-600 mb-4">No hay medicamentos registrados</p>
                    <p className="text-sm text-gray-500 mb-6">Registrar la medicación actual ayuda en caso de emergencias o cuidados temporales.</p>
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
                                  {med.public === 1 ? "👁️ Público" : "🔒 Privado"}
                                </span>
                                {med.frequency && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                    🕒 {med.frequency}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-blue-900 text-lg">💊 {med.medication_name}</h4>
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
                            <button 
                              onClick={() => handleToggleMedicationPublic(med.id)} 
                              className={`px-3 py-1 rounded text-xs font-semibold ${med.public === 1 ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                              {med.public === 1 ? "👁️ Público" : "🔒 Privado"}
                            </button>
                            <button 
                              onClick={() => handleDeleteMedication(med.id)} 
                              className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              🗑️ Eliminar
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
                  <p className="text-sm text-blue-800">
                     <strong>Importante:</strong> Esta información es vital si alguien debe cuidar a tu mascota temporalmente.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del medicamento *</label>
                    <input 
                      type="text" 
                      required 
                      value={medicationForm.medicationName} 
                      onChange={(e) => setMedicationForm({ ...medicationForm, medicationName: e.target.value })} 
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" 
                      placeholder="Ej: Meloxicam, Prednisona..." 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosis *</label>
                    <input 
                      type="text" 
                      required 
                      value={medicationForm.dosage} 
                      onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })} 
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" 
                      placeholder="Ej: 5mg, 10ml, 1 pastilla..." 
                    />
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
                      <option value="Según indicación">Según indicación</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horario específico</label>
                    <input 
                      type="text" 
                      value={medicationForm.schedule} 
                      onChange={(e) => setMedicationForm({ ...medicationForm, schedule: e.target.value })} 
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" 
                      placeholder="Ej: 8:00 AM y 8:00 PM" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Condición</label>
                  <input 
                    type="text" 
                    value={medicationForm.reason} 
                    onChange={(e) => setMedicationForm({ ...medicationForm, reason: e.target.value })} 
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" 
                    placeholder="Ej: Artritis, Alergia crónica, Epilepsia..." 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recetado por</label>
                  <input 
                    type="text" 
                    value={medicationForm.prescribedBy} 
                    onChange={(e) => setMedicationForm({ ...medicationForm, prescribedBy: e.target.value })} 
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" 
                    placeholder="Ej: Dr. Luis Guillermo Estrada" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                    <input 
                      type="date" 
                      value={medicationForm.startDate} 
                      onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })} 
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin (si aplica)</label>
                    <input 
                      type="date" 
                      value={medicationForm.endDate} 
                      onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })} 
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-600 focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={medicationForm.isPublic} 
                      onChange={(e) => setMedicationForm({ ...medicationForm, isPublic: e.target.checked })}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-semibold text-blue-900">️ Mostrar en perfil público</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {medicationForm.isPublic 
                          ? "✅ Cualquier persona que escanee el QR podrá ver esta medicación (recomendado para emergencias)." 
                          : "🔒 Esta información será privada, solo visible para ti en el dashboard."}
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">💾 Guardar medicamento</button>
                  <button type="button" onClick={() => setShowAddMedication(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showLostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚨</div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Reportar Mascota Perdida</h3>
              <p className="text-sm text-gray-600">Estás a punto de reportar a <strong>{showLostModal.name}</strong> como perdido</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción de lo sucedido *</label>
              <textarea value={lostReport} onChange={(e) => setLostReport(e.target.value)} placeholder="Ej: Se escapó del parque ayer por la tarde..." rows={4} className="w-full border border-gray-300 rounded px-3 py-2 focus:border-red-600 focus:outline-none" />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800"><strong>⚠️ Importante:</strong> Esta información será visible públicamente para ayudar a encontrar a tu mascota.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { if (lostReport.trim()) reportLost(showLostModal.id, lostReport); else alert("Por favor describe lo sucedido"); }} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700">🚨 Reportar Perdido</button>
              <button onClick={() => { setShowLostModal(null); setLostReport(""); }} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}