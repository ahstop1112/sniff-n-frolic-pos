import { useState, useMemo } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import EditIcon from "@mui/icons-material/Edit"
import { useAIProductGenerate, type GeneratedProduct, type ValidationFlag } from "../hooks/useAIProductGenerate"

interface AIGenerateBlockProps {
  categorySlug?: string
  onChange: (field: string, value: unknown) => void
}

const AIGenerateBlock = ({ categorySlug, onChange }: AIGenerateBlockProps) => {
  const { state, result, flags, sourceQuality, error, generate, reset } = useAIProductGenerate()
  const [url, setUrl] = useState("")
  const [rawText, setRawText] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [confirmedFields, setConfirmedFields] = useState<Set<string>>(new Set())
  const [ignoredFields, setIgnoredFields] = useState<Set<string>>(new Set())

  // Get flag for a specific field
  const getFlagsForField = (field: string): ValidationFlag[] => {
    return flags.filter(f => f.field === field || f.field.startsWith(`${field}[`))
  }

  // Assemble description HTML
  const assembledDescription = useMemo(() => {
    if (!result) return ""
    const parts: string[] = []

    if (result.enrichment) {
      parts.push(`<p>${escapeHtml(result.enrichment)}</p>`)
    }

    if (result.feiFeiNote) {
      parts.push(`<p><strong>✦ FeiFei Says:</strong> "${escapeHtml(result.feiFeiNote)}"</p>`)
    }

    if (result.benefits.length > 0) {
      parts.push(`<ul>`)
      result.benefits.forEach(b => {
        parts.push(`<li>${escapeHtml(b)}</li>`)
      })
      parts.push(`</ul>`)
    }

    if (result.treatSuggestions && result.treatSuggestions.length > 0) {
      parts.push(`<p><strong>Great with:</strong> ${escapeHtml(result.treatSuggestions.join(", "))}</p>`)
    }

    if (result.dimensions) {
      parts.push(`<p><strong>Dimensions:</strong> ${escapeHtml(result.dimensions)}</p>`)
    }

    return parts.join("")
  }, [result])

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    reset()
    setUrl("")
    setRawText("")
    setEditingField(null)
    setEditValues({})
    setConfirmedFields(new Set())
    setIgnoredFields(new Set())
  }

  const handleGenerate = () => {
    if (!url && !rawText) {
      return
    }
    generate({ url: url || undefined, rawText: rawText || undefined, categorySlug })
  }

  const handleConfirm = (aiField: string, formField: string, value: string) => {
    if (aiField === "description") {
      // description is the assembled HTML
      onChange(formField, assembledDescription)
    } else {
      onChange(formField, value)
    }
    setConfirmedFields(prev => new Set(prev).add(aiField))
    setEditingField(null)
  }

  const handleIgnore = (field: string) => {
    setIgnoredFields(prev => new Set(prev).add(field))
    setEditingField(null)
  }

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValues(prev => ({ ...prev, [field]: currentValue }))
  }

  const handleEditChange = (field: string, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }))
  }

  const handleEditSave = (aiField: string, formField: string) => {
    handleConfirm(aiField, formField, editValues[aiField])
  }

  const handleEditCancel = () => {
    setEditingField(null)
    setEditValues({})
  }

  // Fields to display (excluding arrays and HTML)
  // Each field maps: aiField (from API response) → formField (form state key)
  const displayFields = useMemo(() => {
    if (!result) return []
    return [
      { label: "Product Name", aiField: "productName", formField: "name", value: result.productName },
      { label: "Short Description", aiField: "shortDescription", formField: "short_description", value: result.shortDescription },
      { label: "Description", aiField: "description", formField: "description", value: assembledDescription, isHtml: true },
      { label: "Meta Title", aiField: "metaTitle", formField: "meta_title", value: result.metaTitle },
      { label: "Meta Description", aiField: "metaDescription", formField: "meta_description", value: result.metaDescription },
      { label: "Slug", aiField: "slug", formField: "slug", value: result.computedSlug },
    ]
  }, [result, assembledDescription])

  // Collapsed state
  if (!isOpen) {
    return (
      <Button
        startIcon={<AutoFixHighIcon />}
        variant="outlined"
        onClick={handleOpen}
        sx={{ textTransform: "none", fontSize: 13, mb: 2 }}
      >
        ✨ Generate with AI
      </Button>
    )
  }

  // Expanded state
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
            ✨ AI PRODUCT GENERATOR
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={handleClose}
            sx={{ textTransform: "none", fontSize: 12, color: "text.secondary" }}
          >
            Close
          </Button>
        </Box>

        {/* Loading indicator */}
        {state === "loading" && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, py: 3 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Fetching and analysing…
            </Typography>
          </Box>
        )}

        {/* Input panel */}
        {state !== "loading" && state !== "reviewing" && (
          <>
            <TextField
              label="Supplier URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
              size="small"
              fullWidth
              placeholder="https://example.com/products/..."
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="caption" color="text.secondary">
                or
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>
            <TextField
              label="Raw text / product description"
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={4}
            />
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={!url && !rawText}
              sx={{ textTransform: "none" }}
            >
              Fetch & Generate
            </Button>
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </>
        )}

        {/* Result panel */}
        {state === "reviewing" && result && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 2, pb: 1, borderTop: "1px solid", borderColor: "divider" }}>
              <Chip
                label={`Source: ${sourceQuality}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 11, height: 24 }}
              />
              <Typography variant="caption" color="text.secondary">
                {flags.length} flags
              </Typography>
            </Box>

            {displayFields.map((item, idx) => {
              const fieldFlags = getFlagsForField(item.aiField)
              const isConfirmed = confirmedFields.has(item.aiField)
              const isIgnored = ignoredFields.has(item.aiField)
              const isEditing = editingField === item.aiField

              const statusColor = isConfirmed ? "#50C878" : isIgnored ? "rgba(0,0,0,0.38)" : "inherit"
              const statusBg = isConfirmed ? "rgba(80, 200, 120, 0.08)" : "transparent"

              return (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: statusBg,
                    borderLeft: `3px solid ${statusColor}`,
                    opacity: isIgnored ? 0.6 : 1,
                  }}
                >
                  {/* Row header: label + preview + flags + actions */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, justifyContent: "space-between" }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", display: "block", mb: 0.5 }}>
                        {item.label}
                      </Typography>
                      {!isEditing && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: isIgnored ? "text.disabled" : "text.secondary",
                            fontSize: 13,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                          }}
                        >
                          {item.isHtml ? "[HTML description]" : item.value.slice(0, 60)}
                        </Typography>
                      )}
                    </Box>

                    {/* Flag badges */}
                    {fieldFlags.length > 0 && (
                      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                        {fieldFlags.map((flag, fi) => (
                          <Tooltip key={fi} title={`${flag.code}: ${flag.detail}`}>
                            <Chip
                              label={flag.code}
                              size="small"
                              sx={{
                                fontSize: 10,
                                height: 20,
                                backgroundColor: flag.code === "BANNED_TERM" ? "rgba(240, 125, 107, 0.15)" : "rgba(245, 195, 106, 0.15)",
                                color: flag.code === "BANNED_TERM" ? "#A63A29" : "#8A5A00",
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Edit mode */}
                  {isEditing ? (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <TextField
                        value={editValues[item.aiField] || ""}
                        onChange={e => handleEditChange(item.aiField, e.target.value)}
                        size="small"
                        fullWidth
                        multiline={item.aiField === "description" || item.aiField === "metaDescription"}
                        rows={item.aiField === "description" ? 4 : item.aiField === "metaDescription" ? 2 : 1}
                      />
                      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditSave(item.aiField, item.formField)}
                          sx={{ color: "#50C878" }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleEditCancel}
                          sx={{ color: "text.disabled" }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    /* Confirm/Edit/Ignore buttons */
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-start" }}>
                      {!isConfirmed && !isIgnored && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleConfirm(item.aiField, item.formField, item.value)}
                            sx={{ textTransform: "none", fontSize: 12 }}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => handleEdit(item.aiField, item.value)}
                            sx={{ textTransform: "none", fontSize: 12 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleIgnore(item.aiField)}
                            sx={{ textTransform: "none", fontSize: 12, color: "text.secondary" }}
                          >
                            Ignore
                          </Button>
                        </>
                      )}
                      {isConfirmed && (
                        <Typography variant="caption" sx={{ color: "#1F7A46", fontWeight: 600 }}>
                          ✓ Confirmed
                        </Typography>
                      )}
                      {isIgnored && (
                        <Typography variant="caption" sx={{ color: "text.disabled" }}>
                          Ignored
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )
            })}

            {/* Action buttons */}
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-start", pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  reset()
                  setUrl("")
                  setRawText("")
                  setConfirmedFields(new Set())
                  setIgnoredFields(new Set())
                }}
                sx={{ textTransform: "none", fontSize: 12, color: "text.secondary" }}
              >
                Start over
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function escapeHtml(text: string): string {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

export default AIGenerateBlock
