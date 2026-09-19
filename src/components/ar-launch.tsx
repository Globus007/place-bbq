import { useRef, type MutableRefObject } from "react";
import { toast } from "sonner";
import * as THREE from "three";
import { USDZExporter } from "three/addons/exporters/USDZExporter.js";
import type { StoveCanvasHandle } from "./stove-canvas";

type Props = {
  canvas: MutableRefObject<StoveCanvasHandle | null>;
};

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

async function launchQuickLook(group: THREE.Object3D) {
  const exporter = new USDZExporter();
  const data = await exporter.parseAsync(group);
  const blob = new Blob([data], { type: "model/vnd.usdz+zip" });
  const file = new File([blob], "pech.usdz", { type: "model/vnd.usdz+zip" });
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.rel = "ar";
  a.href = url;
  const img = document.createElement("img");
  img.alt = "Барбекю-комплекс";
  a.appendChild(img);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

async function launchWebXR(handle: StoveCanvasHandle) {
  const renderer = handle.getRenderer();
  const xr = navigator.xr;
  if (!renderer || !xr) throw new Error("no xr");
  const ok = await xr.isSessionSupported("immersive-ar");
  if (!ok) throw new Error("no ar");
  renderer.xr.enabled = true;
  const session = await xr.requestSession("immersive-ar", {
    requiredFeatures: ["local-floor"],
    optionalFeatures: ["hit-test"],
  });
  session.addEventListener("end", () => {
    renderer.xr.enabled = false;
  });
  await renderer.xr.setSession(session);
}

export function useArLaunch({ canvas }: Props) {
  const busy = useRef(false);

  async function launch() {
    if (busy.current) return;
    const handle = canvas.current;
    const group = handle?.getStove();
    if (!handle || !group) {
      toast("Модель ещё собирается — нажмите ещё раз.");
      return;
    }
    busy.current = true;
    try {
      if (isIOS()) {
        await launchQuickLook(group);
        return;
      }
      await launchWebXR(handle);
    } catch {
      toast("Откройте ссылку на iPhone или Android — камера поставит печь на пол.");
    } finally {
      busy.current = false;
    }
  }

  return { launch };
}
