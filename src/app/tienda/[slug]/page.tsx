import { notFound } from "next/navigation";
import { query } from "@/lib/db";

async function getClinicData(slug: string) {
  try {
    // Consultar DIRECTAMENTE a Turso (sin fetch interno)
    const clinicResult = await query(
      "SELECT * FROM clinics WHERE slug = ? AND status = 'active'",
      [slug]
    );

    if (!clinicResult.rows || clinicResult.rows.length === 0) {
      return null;
    }

    const clinic = clinicResult.rows[0] as any;

    // Obtener servicios activos
    const servicesResult = await query(
      "SELECT * FROM clinic_services WHERE clinic_id = ? AND active = 1 ORDER BY name ASC",
      [clinic.id]
    );

    return {
      clinic,
      services: servicesResult.rows || [],
    };
  } catch (error) {
    console.error("Error fetching clinic:", error);
    return null;
  }
}

export default async function TiendaPublicaPage(props: { params: { slug: string } }) {
  const { slug } = props.params;
  const data = await getClinicData(slug);

  if (!data) {
    notFound();
  }

  const clinic = data.clinic;
  const services = data.services;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {clinic.business_image_url && (
        <div style={{ position: "relative", height: "300px", overflow: "hidden" }}>
          <img
            src={clinic.business_image_url}
            alt={clinic.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))",
            }}
          />
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "40px",
            marginTop: clinic.business_image_url ? "-80px" : "0",
            position: "relative",
            zIndex: 10,
          }}
        >
          {clinic.logo_url ? (
            <img
              src={clinic.logo_url}
              alt="Logo"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "20px",
                objectFit: "cover",
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #7c3aed 0%, #10b981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "60px",
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              🏥
            </div>
          )}
          <div>
            <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "#1f2937", margin: "0 0 8px 0" }}>
              {clinic.name}
            </h1>
            {clinic.specialty && (
              <p style={{ fontSize: "18px", color: "#6b7280", margin: "0 0 8px 0" }}>
                {clinic.specialty}
              </p>
            )}
            {clinic.address && (
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                📍 {clinic.address}
                {clinic.city && `, ${clinic.city}`}
                {clinic.country && `, ${clinic.country}`}
              </p>
            )}
            {clinic.phone && (
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0 0" }}>
                📞 {clinic.phone}
              </p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>
            Nuestros Servicios
          </h2>

          {services.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "60px 24px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚕️</div>
              <h3 style={{ color: "#374151", marginBottom: "8px" }}>
                Aún no hay servicios disponibles
              </h3>
              <p style={{ color: "#6b7280" }}>
                Pronto agregaremos nuestros servicios
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {services.map((service: any) => (
                <div
                  key={service.id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", margin: "0 0 4px 0" }}>
                        {service.name}
                      </h3>
                      {service.category && (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            background: "#f3e8ff",
                            color: "#7c3aed",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {service.category}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981", marginLeft: "16px" }}>
                      ${parseFloat(service.price).toFixed(2)}
                    </div>
                  </div>

                  {service.description && (
                    <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.5", margin: "12px 0" }}>
                      {service.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>
                      ️ {service.duration_minutes} minutos
                    </span>
                    <button
                      style={{
                        padding: "8px 20px",
                        background: "linear-gradient(135deg, #7c3aed 0%, #10b981 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "24px",
            color: "#6b7280",
            fontSize: "14px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <p>
            Powered by{" "}
            <a
              href="https://xpi-pet.vercel.app"
              style={{ color: "#7c3aed", textDecoration: "none", fontWeight: "600" }}
            >
              XpiPet
            </a>{" "}
            - Memoria de vida para tu mascota
          </p>
        </div>
      </div>
    </div>
  );
}