"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AppointmentApproval = {
  type: "booking_confirmation";
  message: string;
  appointment: {
    pet_name: string;
    date: string;
    time: string;
    reason: string;
  };
};

type ChatResponse = {
  response?: string;
  thread_id?: string;
  status?: string;
  approval?: AppointmentApproval | null;
  message?: string;
};

function getThreadId() {
  const existingThreadId = localStorage.getItem(
    "vetcare-chat-thread-id",
  );
console.log("THREAD ID:", existingThreadId);
  if (existingThreadId) {
    return existingThreadId;
  }

  const newThreadId = crypto.randomUUID();

  localStorage.setItem(
    "vetcare-chat-thread-id",
    newThreadId,
  );

  return newThreadId;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>(
    [],
  );

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [approval, setApproval] =
    useState<AppointmentApproval | null>(null);

  function startNewChat() {
    const newThreadId = crypto.randomUUID();
console.log("NEW THREAD ID:", newThreadId);
    localStorage.setItem(
      "vetcare-chat-thread-id",
      newThreadId,
    );

    setMessages([]);
    setApproval(null);
    setInput("");
    setLoading(false);
  }

  async function sendMessage(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading || approval) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const threadId = getThreadId();

      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message,
          thread_id: threadId,
        }),
      });

      const data: ChatResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.response ||
            "No se pudo procesar el mensaje.",
        );
      }

      if (
        data.status === "waiting_approval" &&
        data.approval
      ) {
        setApproval(data.approval);
      }

      if (data.response) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
        };

        setMessages((current) => [
          ...current,
          assistantMessage,
        ]);
      }
    } catch (error) {
      console.error(
        "Chat error:",
        error,
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Ocurrió un error al comunicarnos con VetCare AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function confirmAppointment() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const threadId = getThreadId();

      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          thread_id: threadId,
          resume: true,
        }),
      });

      const data: ChatResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.response ||
            "No se pudo confirmar el turno.",
        );
      }

      setApproval(null);

      if (data.response) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
        };

        setMessages((current) => [
          ...current,
          assistantMessage,
        ]);
      }
    } catch (error) {
      console.error(
        "Appointment confirmation error:",
        error,
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "No se pudo confirmar el turno. Intentá nuevamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function cancelAppointment() {
    setApproval(null);

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content:
          "Perfecto, no confirmé el turno. Si querés, podemos elegir otro horario.",
      },
    ]);
  }

  function formatDate(date: string) {
    const [year, month, day] =
      date.split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-2xl text-white shadow-lg transition hover:bg-teal-700"
        aria-label="Abrir asistente"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* HEADER */}
          <div className="flex items-center justify-between bg-teal-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">
                VetCare AI
              </p>

              <p className="text-xs text-teal-100">
                Asistente virtual
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={startNewChat}
                className="text-xs font-medium text-teal-100 transition hover:text-white"
              >
                Nuevo chat
              </button>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="text-xl leading-none hover:opacity-80"
                aria-label="Cerrar asistente"
              >
                ×
              </button>
            </div>
          </div>

          {/* MENSAJES */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 && (
              <div className="rounded-xl bg-white p-4 text-sm text-gray-600 shadow-sm">
                <p className="font-medium text-gray-900">
                  ¡Hola! 👋
                </p>

                <p className="mt-1">
                  Soy el asistente virtual de
                  VetCare.
                </p>

                <p className="mt-2">
                  Puedo ayudarte con información
                  veterinaria y turnos.
                </p>
              </div>
            )}

            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-br-sm bg-teal-600 px-4 py-2 text-sm text-white"
                        : "max-w-[80%] rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-gray-800 shadow-sm"
                    }
                  >
                    {message.content}
                  </div>
                </div>
              ),
            )}

            {/* TARJETA DE CONFIRMACIÓN */}
            {approval && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md">
                <div className="mb-4">
                  <p className="text-base font-semibold text-gray-900">
                    Confirmar turno
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Revisá los datos antes de confirmar.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* MASCOTA */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                      🐶
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        Mascota
                      </p>

                      <p className="truncate text-sm font-semibold text-gray-900">
                        {approval.appointment.pet_name}
                      </p>
                    </div>
                  </div>

                  {/* FECHA */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                      📅
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Fecha
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(
                          approval.appointment.date,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* HORA */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                      🕐
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Hora
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {approval.appointment.time}
                      </p>
                    </div>
                  </div>

                  {/* MOTIVO */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                      📋
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        Motivo
                      </p>

                      <p className="break-words text-sm font-semibold text-gray-900">
                        {approval.appointment.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTONES */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={cancelAppointment}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={confirmAppointment}
                    disabled={loading}
                    className="w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Confirmando..."
                      : "Confirmar"}
                  </button>
                </div>
              </div>
            )}

            {/* LOADING */}
            {loading && !approval && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                  Escribiendo...
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}
          <form
            onSubmit={sendMessage}
            className="border-t border-gray-200 bg-white p-3"
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Escribí tu consulta..."
                disabled={
                  loading || !!approval
                }
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-gray-100"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !!approval ||
                  !input.trim()
                }
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}