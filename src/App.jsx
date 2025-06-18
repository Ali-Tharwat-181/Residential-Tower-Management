import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useCallback } from "react";
// import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";

// تعريف نموذج التحقق
const residentSchema = z.object({
  name: z
    .string()
    .min(2, "الاسم يجب أن يكون على الأقل حرفين")
    .regex(/^[\u0600-\u06FF\s]+$/, "الاسم يجب أن يحتوي على أحرف عربية فقط"),
  floor: z.string().min(1, "يجب اختيار الدور"),
  apartment: z
    .number()
    .min(1, "رقم الشقة يجب أن يكون على الأقل 1")
    .max(500, "رقم الشقة لا يمكن أن يكون أكثر من 500"),
  phone: z
    .string()
    .length(11, "رقم الهاتف يجب أن يكون 11 رقمًا")
    .startsWith("010", "رقم الهاتف يجب أن يبدأ بـ 010"),
  notes: z.string().optional(),
});

// Custom hook for localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      console.log(`Loading ${key} from localStorage:`, item);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        console.log(`Saved ${key} to localStorage:`, valueToStore);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

export default function ResidentList() {
  const [residents, setResidents] = useLocalStorage("buildingResidents", []);
  const [editIndex, setEditIndex] = useState(null);
  const tableRef = useRef();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(residentSchema),
  });

  const onSubmit = (data) => {
    if (editIndex !== null) {
      // تحديث الساكن الموجود
      const updatedResidents = [...residents];
      updatedResidents[editIndex] = data;
      setResidents(updatedResidents);
      setEditIndex(null);
    } else {
      // إضافة ساكن جديد
      setResidents([...residents, data]);
    }
    reset();
  };

  const handleEdit = (index) => {
    const resident = residents[index];
    reset({
      ...resident,
      apartment: resident.apartment,
    });
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    if (confirm("هل أنت متأكد من حذف هذا الساكن؟")) {
      setResidents(residents.filter((_, i) => i !== index));
    }
  };

  const clearAllData = () => {
    if (
      confirm(
        "هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه."
      )
    ) {
      setResidents([]);
      alert("تم حذف جميع البيانات بنجاح");
    }
  };

  const debugLocalStorage = () => {
    const saved = localStorage.getItem("buildingResidents");
    console.log("Current localStorage value:", saved);
    console.log("Current residents state:", residents);
    console.log("localStorage available:", typeof localStorage !== "undefined");
    alert(
      `Debug Info:\nlocalStorage value: ${saved}\nCurrent residents: ${residents.length}\nCheck console for details`
    );
  };

  const downloadPDF = () => {
    try {
      // إنشاء عنصر HTML مؤقت للتصدير
      const printElement = document.createElement("div");
      printElement.innerHTML = `
        <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="text-align: center; color: #2980b9; margin-bottom: 20px;"> قائمة سكان العمارة  السكنية</h1>
          <p style="text-align: right; margin-bottom: 20px;">تاريخ التصدير: ${new Date().toLocaleDateString(
            "ar-EG"
          )}</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #2980b9; color: white;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">#</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الاسم</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الدور</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الشقة</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الهاتف</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${residents
                .map(
                  (resident, index) => `
                <tr style="background-color: ${
                  index % 2 === 0 ? "#f9f9f9" : "white"
                };">
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
                    index + 1
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${
                    resident.name
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
                    resident.floor
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
                    resident.apartment
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
                    resident.phone
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${
                    resident.notes || "-"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <p style="text-align: center; font-weight: bold;">  إجمالي عدد السكان  ${
            residents.length
          }</p>
        </div>
      `;

      // إعدادات html2pdf
      const opt = {
        margin: 1,
        filename: "قائمة_السكان.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
      };

      // إنشاء PDF
      html2pdf()
        .set(opt)
        .from(printElement)
        .save()
        .then(() => {
          alert("تم تصدير القائمة بنجاح!");
        });
    } catch (error) {
      console.error("خطأ في إنشاء PDF:", error);
      alert("حدث خطأ أثناء إنشاء PDF. يرجى المحاولة مرة أخرى.");
    }
  };

  const floors = [
    "الدور الأول",
    "الدور الثاني",
    "الدور الثالث",
    "الدور الرابع",
    "الدور الخامس",
    "الدور السادس",
    "الدور السابع",
    "الدور الثامن",
    "الدور التاسع",
    "الدور العاشر",
    "الدور الحادي عشر",
    "الدور الثاني عشر",
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
            🏢 نظام إدارة سكان العمارة السكنية
          </h1>
          <p className="text-center text-blue-100 text-lg">
            إدارة شاملة لسكان العمارة مع إمكانية التصدير والبحث
          </p>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-gray-600 text-sm">إجمالي السكان</p>
                <p className="text-3xl font-bold text-gray-800">
                  {residents.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-gray-600 text-sm">الشقق المشغولة</p>
                <p className="text-3xl font-bold text-gray-800">
                  {residents.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-gray-600 text-sm">آخر تحديث</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date().toLocaleDateString("ar-EG")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg
                className="w-6 h-6 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {editIndex !== null ? "تعديل بيانات الساكن" : "إضافة ساكن جديد"}
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">
                      الاسم الكامل
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="أدخل اسم الساكن"
                    className={`input input-bordered w-full transition-all duration-300 ${
                      errors.name
                        ? "input-error border-2"
                        : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-error mt-2 text-right text-sm flex items-center">
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">
                      رقم الهاتف
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder="010XXXXXXXX"
                    className={`input input-bordered w-full transition-all duration-300 ${
                      errors.phone
                        ? "input-error border-2"
                        : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-error mt-2 text-right text-sm flex items-center">
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">
                      الدور
                    </span>
                  </label>
                  <select
                    className={`select select-bordered w-full transition-all duration-300 ${
                      errors.floor
                        ? "select-error border-2"
                        : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    {...register("floor")}
                  >
                    <option value="">اختر الدور</option>
                    {floors.map((floor, index) => (
                      <option key={index} value={floor}>
                        {floor}
                      </option>
                    ))}
                  </select>
                  {errors.floor && (
                    <p className="text-error mt-2 text-right text-sm flex items-center">
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.floor.message}
                    </p>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">
                      رقم الشقة
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="رقم الشقة"
                    className={`input input-bordered w-full transition-all duration-300 ${
                      errors.apartment
                        ? "input-error border-2"
                        : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    {...register("apartment", { valueAsNumber: true })}
                  />
                  {errors.apartment && (
                    <p className="text-error mt-2 text-right text-sm flex items-center">
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.apartment.message}
                    </p>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">
                      ملاحظات
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="ملاحظات إضافية"
                    className="input input-bordered w-full transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    {...register("notes")}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg px-8 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {editIndex !== null ? "تحديث" : "إضافة"} الساكن
                </button>
                {editIndex !== null && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-lg px-8 transition-all duration-300 hover:bg-gray-100"
                    onClick={() => {
                      reset();
                      setEditIndex(null);
                    }}
                  >
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Residents List Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                قائمة السكان
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge badge-primary badge-lg text-white">
                  العدد الكلي: {residents.length}
                </span>
                <button
                  onClick={downloadPDF}
                  className="btn btn-success btn-sm transition-all duration-300 hover:scale-105 shadow-lg"
                  disabled={residents.length === 0}
                >
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  تصدير إلى PDF
                </button>
                <button
                  onClick={clearAllData}
                  className="btn btn-error btn-sm transition-all duration-300 hover:scale-105 shadow-lg"
                  disabled={residents.length === 0}
                >
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  حذف جميع البيانات
                </button>
                <button
                  onClick={debugLocalStorage}
                  className="btn btn-info btn-sm transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  تحقق من البيانات
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {residents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  لا يوجد سكان مسجلين بعد
                </h3>
                <p className="text-gray-500">
                  ابدأ بإضافة ساكن جديد باستخدام النموذج أعلاه
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full" ref={tableRef}>
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-center font-bold text-gray-700">#</th>
                      <th className="text-right font-bold text-gray-700">
                        الاسم
                      </th>
                      <th className="text-center font-bold text-gray-700">
                        الدور
                      </th>
                      <th className="text-center font-bold text-gray-700">
                        الشقة
                      </th>
                      <th className="text-center font-bold text-gray-700">
                        الهاتف
                      </th>
                      <th className="text-right font-bold text-gray-700">
                        ملاحظات
                      </th>
                      <th className="text-center font-bold text-gray-700">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {residents.map((resident, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="text-center font-semibold text-gray-600">
                          {index + 1}
                        </td>
                        <td className="font-bold text-gray-800 text-right">
                          {resident.name}
                        </td>
                        <td className="text-center">
                          <span className="badge badge-primary badge-outline w-[130px]">
                            {resident.floor}
                          </span>
                        </td>
                        <td className="text-center font-semibold text-gray-700">
                          {resident.apartment}
                        </td>
                        <td className="text-center">
                          <span className="font-mono text-blue-600">
                            {resident.phone}
                          </span>
                        </td>
                        <td className="text-right text-gray-600">
                          {resident.notes || "-"}
                        </td>
                        <td>
                          <div className="flex gap-2 justify-center">
                            <button
                              className="btn btn-xs btn-outline btn-info transition-all duration-300 hover:scale-105"
                              onClick={() => handleEdit(index)}
                            >
                              <svg
                                className="w-3 h-3 ml-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              تعديل
                            </button>
                            <button
                              className="btn btn-xs btn-outline btn-error transition-all duration-300 hover:scale-105"
                              onClick={() => handleDelete(index)}
                            >
                              <svg
                                className="w-3 h-3 ml-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
