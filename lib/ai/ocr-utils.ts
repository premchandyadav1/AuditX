export async function performOCR(file: File) {
  try {
    const formData = new FormData()
    formData.append("file", file)
    // Use free OCR.space API key
    formData.append("apikey", "K89248956688957")
    formData.append("language", "eng")
    formData.append("isTable", "true")
    formData.append("scale", "true")
    formData.append("isOverlayRequired", "false")

    console.log("[v0] Performing OCR on file:", file.name)

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`OCR.space API error: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.IsErroredOnProcessing) {
      throw new Error(`OCR processing error: ${result.ErrorMessage.join(", ")}`)
    }

    const extractedText = result.ParsedResults?.map((res: any) => res.ParsedText).join("\n") || ""

    console.log("[v0] OCR extraction successful. Text length:", extractedText.length)

    return {
      fileName: file.name,
      extractedText,
      rawResult: result,
      vendorName: "Detected from OCR",
      totalAmount: 0,
      date: new Date().toISOString().split("T")[0],
    }
  } catch (error) {
    console.error("[v0] OCR Error - attempting fallback:", error)
    // Fallback: Return minimal data and let Gemini AI handle the extraction
    return {
      fileName: file.name,
      extractedText: "",
      rawResult: null,
      vendorName: "Processing failed - manual review needed",
      totalAmount: 0,
      date: new Date().toISOString().split("T")[0],
    }
  }
}
