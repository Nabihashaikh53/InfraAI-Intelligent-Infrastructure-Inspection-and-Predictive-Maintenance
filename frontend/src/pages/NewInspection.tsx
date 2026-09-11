import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CloudUpload,
  FileText,
  Loader2,
  MapPin,
  X,
} from "lucide-react";

import {
  uploadInspectionImage,
  createInspection,
} from "../services/api";

interface UploadResponse {
  uploadId: string;
  filename: string;
  contentType: string;
  size: number;
  status: string;
}

interface InspectionResponse {
  id: string;
  inspectionId: string;
  assetId: string;
  userId: string;
  imageUrl: string;
  inspectionDate: string;
  status: string;
}

export default function NewInspection() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upload, setUpload] = useState<UploadResponse | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [deteriorationStatus, setDeteriorationStatus] = useState("");

  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdInspectionId, setCreatedInspectionId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");
    setUpload(null);

    if (!file.type.startsWith("image/")) {
      setSelectedFile(null);
      setError("Please select an image file.");
      return;
    }

    // Backend limit is 10 MB.
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setSelectedFile(null);
      setError("Image is too large. Please choose an image under 10 MB.");
      return;
    }

    setSelectedFile(file);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function removeFile() {
    setSelectedFile(null);
    setUpload(null);
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /*
   * STEP 1
   *
   * Upload the image FIRST.
   *
   * No asset exists yet.
   */
  async function handleImageUpload() {
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("Please select an inspection image first.");
      return;
    }

    try {
      setUploading(true);

      const response = (await uploadInspectionImage(
        selectedFile,
      )) as UploadResponse;

      console.log("Image upload response:", response);

      if (!response?.uploadId) {
        throw new Error(
          "The backend did not return an upload ID.",
        );
      }

      setUpload(response);

      setSuccess(
        "Image uploaded successfully. Now enter the inspection details.",
      );
    } catch (err: any) {
      console.error("Image upload failed:", err);

      let message = "Unable to upload inspection image.";

      if (err?.response?.data?.detail) {
        message = String(err.response.data.detail);
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setUploading(false);
    }
  }

  /*
   * STEP 2
   *
   * Create the asset and inspection.
   *
   * The backend generates the Asset ID here.
   */
  async function handleCreateInspection() {
    setError("");
    setSuccess("");

    if (!upload?.uploadId) {
      setError("Please upload the inspection image first.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter an asset name.");
      return;
    }

    if (!type.trim()) {
      setError("Please enter an asset type.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter the asset location.");
      return;
    }

    try {
      setCreating(true);

      const response = (await createInspection({
        upload_id: upload.uploadId,
        name: name.trim(),
        type: type.trim(),
        location: location.trim(),
        description: description.trim() || undefined,
        deterioration_status:
          deteriorationStatus || undefined,
      })) as InspectionResponse;

      console.log("Inspection created:", response);

       if (!response?.id) {
       throw new Error(
      "The backend did not return the inspection database ID.",
     );
     }

setCreatedInspectionId(response.id);

      setSuccess(
        `Inspection ${response.inspectionId} created for ${response.assetId}. Opening defect detection...`,
      );

      setTimeout(() => {
        navigate(`/inspection/detect/${response.id}`);
      }, 500);
    } catch (err: any) {
      console.error("Inspection creation failed:", err);

      let message = "Unable to create the inspection.";

      if (err?.response?.data?.detail) {
        message = String(err.response.data.detail);
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setCreating(false);
    }
  }

  const busy = uploading || creating;

  return (
    <div className="min-h-screen bg-[#F5F3EE] px-6 py-8 text-[#17293D] lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">
          <Link
            to="/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#376CF3] hover:underline"
          >
            ← Back to dashboard
          </Link>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#376CF3]">
            Inspection workflow
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#17293D]">
            New Inspection
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Upload the inspection image first. After the image is stored,
            enter the asset details and InfraAI will generate the Asset ID
            automatically.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <X size={19} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">
                Success
              </p>

              <p className="mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* PROCESS STEPS */}

        <div className="mb-6 grid gap-3 md:grid-cols-4">

          <div
            className={`rounded-xl border p-4 ${
              !upload
                ? "border-[#376CF3] bg-[#EEF4FF]"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <div
              className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                upload
                  ? "bg-emerald-500 text-white"
                  : "bg-[#376CF3] text-white"
              }`}
            >
              {upload ? <Check size={16} /> : "1"}
            </div>

            <p className="text-sm font-bold text-[#17293D]">
              Upload image
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Store the inspection image first.
            </p>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              upload
                ? "border-[#376CF3] bg-[#EEF4FF]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
              2
            </div>

            <p className="text-sm font-bold text-[#17293D]">
              Asset details
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Enter the infrastructure information.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
              3
            </div>

            <p className="text-sm font-bold text-[#17293D]">
              Detect defects
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Run the real YOLO model.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
              4
            </div>

            <p className="text-sm font-bold text-[#17293D]">
              Assess risk
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Calculate severity and risk.
            </p>
          </div>

        </div>

        {/* MAIN CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

          {/* IMAGE */}

          <div className="mb-10">

            <div className="mb-3">
              <h2 className="text-lg font-bold text-[#17293D]">
                1. Upload inspection image
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                The image is uploaded and stored before any asset is created.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (

              <button
                type="button"
                onClick={openFilePicker}
                disabled={busy}
                className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-[#376CF3] hover:bg-[#EEF4FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#376CF3] shadow-sm transition group-hover:scale-105">
                  <CloudUpload size={30} />
                </div>

                <p className="text-base font-bold text-[#17293D]">
                  Click to choose an image
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  JPG, JPEG, PNG or WEBP
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Maximum file size: 10 MB
                </p>
              </button>

            ) : (

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <Check size={26} />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-[#17293D]">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>

                      <p className="mt-1 text-xs font-semibold text-emerald-600">
                        {upload
                          ? "Image stored in MongoDB"
                          : "Image selected and ready"}
                      </p>

                    </div>

                  </div>

                  {!upload && (
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  )}

                </div>

                {!upload && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={busy}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#376CF3] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2859D9] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Uploading image...
                      </>
                    ) : (
                      <>
                        <CloudUpload size={18} />
                        Upload Image
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                )}

              </div>
            )}

          </div>

          {/* ASSET DETAILS */}

          {upload && (
            <div className="border-t border-slate-100 pt-8">

              <div className="mb-6">

                <h2 className="text-lg font-bold text-[#17293D]">
                  2. Enter asset & inspection details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  The Asset ID will be generated automatically after you
                  submit these details.
                </p>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Asset name */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17293D]">
                    Asset name *
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    disabled={creating}
                    placeholder="e.g. Bandra Flyover"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#376CF3] focus:ring-2 focus:ring-[#376CF3]/20 disabled:bg-slate-50"
                  />
                </div>

                {/* Asset type */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17293D]">
                    Asset type *
                  </label>

                  <input
                    type="text"
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value)
                    }
                    disabled={creating}
                    placeholder="e.g. Bridge"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#376CF3] focus:ring-2 focus:ring-[#376CF3]/20 disabled:bg-slate-50"
                  />
                </div>

                {/* Location */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17293D]">
                    Location *
                  </label>

                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      disabled={creating}
                      placeholder="e.g. Bandra, Mumbai"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#376CF3] focus:ring-2 focus:ring-[#376CF3]/20 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Deterioration */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17293D]">
                    Deterioration status
                  </label>

                  <select
                    value={deteriorationStatus}
                    onChange={(event) =>
                      setDeteriorationStatus(event.target.value)
                    }
                    disabled={creating}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#376CF3] focus:ring-2 focus:ring-[#376CF3]/20 disabled:bg-slate-50"
                  >
                    <option value="">
                      Not specified
                    </option>
                    <option value="significant">
                      Significant
                    </option>
                    <option value="rapid">
                      Rapid
                    </option>
                  </select>
                </div>

              </div>

              {/* Description */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold text-[#17293D]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  disabled={creating}
                  rows={4}
                  placeholder="Optional description of the infrastructure asset..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#376CF3] focus:ring-2 focus:ring-[#376CF3]/20 disabled:bg-slate-50"
                />

              </div>

              {/* SUBMIT */}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="button"
                  onClick={handleCreateInspection}
                  disabled={
                    creating ||
                    !name.trim() ||
                    !type.trim() ||
                    !location.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#376CF3] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2859D9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Creating inspection...
                    </>
                  ) : (
                    <>
                      Create Inspection
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </div>

            </div>
          )}

        </div>

        {createdInspectionId && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm text-slate-600">
        Inspection created successfully.
        </p>

         <Link
         to={`/reports/${createdInspectionId}`}
         className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#376CF3] hover:underline"
         >
         View full report →
        </Link>
        </div>
      )}

        {/* FOOTER HELP */}

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-xs text-slate-500 shadow-sm">

          <FileText
            size={17}
            className="shrink-0 text-[#376CF3]"
          />

          <p>
            The image is stored in MongoDB first. After you submit the
            asset details, InfraAI generates the Asset ID, creates the
            inspection record, and moves to the real YOLO defect detection
            stage.
          </p>

        </div>

      </div>
    </div>
  );
}