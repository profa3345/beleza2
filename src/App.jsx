/**
 * App.jsx — Orquestrador principal
 *
 * Responsabilidade: roteamento entre telas + estado global mínimo.
 * Zero lógica de negócio inline.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Telas (pages/)          Hook / Serviço usado                       │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  HomePage                searchEstablishments() via Firestore       │
 * │  ResultsPage             —                                          │
 * │  LandingPage             —                                          │
 * │  TypeSelectionPage       FormPF (interno)                           │
 * │  RegisterPJPage          useRegisterPJ + useAutosave + useCEP       │
 * │  ReviewPage              —                                          │
 * │  DashboardPage           ServiceEditor + ProductEditor              │
 * │  AdminPanel              fetchAdminRecords + reviewRecord           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * TODOs de produção — ver ARCHITECTURE.md:
 *   🔴 Cloud Functions para escrita no Firestore (services/firestore.js)
 *   🔴 Firebase Custom Claims para admin (hooks/useAuth.js)
 *   🟡 Firebase Storage para uploads reais (components/editors/*.jsx)
 */

import React, { useState } from "react";
import { loadDraft, searchEstablishments } from "./services/firestore.js";
import { useAuth }  from "./hooks/useAuth.js";
import { useToast } from "./hooks/useToast.js";
import { Toast, PageLoader } from "./components/ui/index.jsx";
import { Navbar }            from "./components/ui/Navbar.jsx";
import { AdminPanel }        from "./components/admin/AdminPanel.jsx";
import { HomePage }          from "./pages/HomePage.jsx";
import { ResultsPage }       from "./pages/ResultsPage.jsx";
import { LandingPage }       from "./pages/LandingPage.jsx";
import { TypeSelectionPage } from "./pages/TypeSelectionPage.jsx";
import { RegisterPJPage }    from "./pages/RegisterPJPage.jsx";
import { ReviewPage }        from "./pages/ReviewPage.jsx";
import { DashboardPage }     from "./pages/DashboardPage.jsx";
import "./styles/global.css";

export default function App() {
  const [screen,      setScreen]      = useState("home");
  const [accountType, setAccountType] = useState(null);

  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchResults,  setSearchResults]  = useState([]);
  const [searching,      setSearching]      = useState(false);

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);

  const [reviewProtocol, setReviewProtocol] = useState("");
  const [reviewEmail,    setReviewEmail]    = useState("");
  const [draftLoading,   setDraftLoading]   = useState(false);
  const [draftData,      setDraftData]      = useState(null);

  const { authUser, isAdmin, authLoading, hasDraft, setHasDraft } = useAuth();
  const { toast, showToast } = useToast();

  // ── Busca
  const handleSearch = async () => {
    if (!searchQuery.trim() && !searchCategory) return;
    setSearching(true);
    try {
      const results = await searchEstablishments(searchQuery.trim(), searchCategory);
      setSearchResults(results);
      setScreen("results");
    } catch {
      setSearchResults([]);
      setScreen("results");
    } finally {
      setSearching(false);
    }
  };

  // ── Restaurar rascunho
  const restoreDraft = async () => {
    if (!authUser) return;
    setDraftLoading(true);
    try {
      const draft = await loadDraft(authUser.uid);
      if (draft) {
        setDraftData(draft);
        setHasDraft(false);
        showToast("Rascunho restaurado ✓", "success");
        setScreen("register");
      }
    } catch {
      showToast("Erro ao carregar rascunho", "error");
    } finally {
      setDraftLoading(false);
    }
  };

  const onSuccessRegister = (protocol, email) => {
    setReviewProtocol(protocol);
    setReviewEmail(email);
    setScreen("review");
  };

  if (authLoading) return <PageLoader />;

  return (
    <div style={{ minHeight:"100vh", background:"var(--cream)" }}>
      <Toast toast={toast} />

      {hasDraft && screen === "landing" && authUser && (
        <div className="draft-banner fade-up">
          <span className="draft-banner__text">
            ☁️ Rascunho salvo no Firebase. Deseja continuar de onde parou?
          </span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn--gold" onClick={restoreDraft} disabled={draftLoading}
              style={{ padding:"6px 16px", borderRadius:6, fontSize:"0.75rem" }}>
              {draftLoading ? "Carregando..." : "Restaurar rascunho"}
            </button>
            <button className="btn btn--ghost" onClick={() => setHasDraft(false)}
              style={{ padding:"6px 12px", borderRadius:6, fontSize:"0.75rem" }}>
              Descartar
            </button>
          </div>
        </div>
      )}

      <Navbar
        onHome     ={() => setScreen("home")}
        onAdmin    ={() => setScreen("admin")}
        onRegister ={() => setScreen("landing")}
        authUser={authUser}
        isAdmin={isAdmin}
      />

      {screen === "home" && (
        <HomePage
          searchQuery={searchQuery}       setSearchQuery={setSearchQuery}
          searchCategory={searchCategory} setSearchCategory={setSearchCategory}
          onSearch={handleSearch}         searching={searching}
        />
      )}

      {screen === "results" && (
        <ResultsPage
          results={searchResults}
          searchQuery={searchQuery}
          searchCategory={searchCategory}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "landing" && (
        <LandingPage
          onStart={() => setScreen("type")}
          onSelectPlan={id => { setAccountType(id); setScreen("type"); }}
        />
      )}

      {screen === "type" && (
        <TypeSelectionPage
          accountType={accountType}
          onSelectAccountType={setAccountType}
          onContinuePJ  ={() => setScreen("register")}
          onSuccessPF   ={onSuccessRegister}
          showToast={showToast}
        />
      )}

      {screen === "register" && (
        <RegisterPJPage
          authUser={authUser}
          accountType={accountType}
          services={services}   setServices={setServices}
          products={products}   setProducts={setProducts}
          showToast={showToast}
          initialData={draftData}
          onSuccess={onSuccessRegister}
        />
      )}

      {screen === "review" && (
        <ReviewPage
          protocol={reviewProtocol}
          email={reviewEmail}
          onGoToDashboard={() => setScreen("dashboard")}
        />
      )}

      {screen === "dashboard" && (
        <DashboardPage
          authUser={authUser}
          accountType={accountType}
          services={services}   setServices={setServices}
          products={products}   setProducts={setProducts}
          showToast={showToast}
        />
      )}

      {screen === "admin" && (
        <AdminPanel isAdmin={isAdmin} authUser={authUser} showToast={showToast} />
      )}
    </div>
  );
}
