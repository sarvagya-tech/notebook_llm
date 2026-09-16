// Default maximum characters per chunk
const DEFAULT_CHUNK_SIZE = 1000;

// Default overlap between consecutive chunks
const DEFAULT_CHUNK_OVERLAP = 100;

// Separators tried from most natural to most aggressive
const SEPARATORS = ["\n\n", "\n", ". ", " ", ""];

/**
 * Combines small text splits into larger chunks
 * without exceeding chunkSize.
 */
function mergeSplits(splits, separator, chunkSize) {
    const docs = [];

    let current = [];
    let total = 0;

    for (const split of splits) {
        const len = split.length;

        const sepLen =
            current.length > 0
                ? separator.length
                : 0;

        // If adding this split would exceed the chunk size,
        // save the current chunk and start a new one.
        if (
            total + len + sepLen > chunkSize &&
            current.length > 0
        ) {
            docs.push(current.join(separator));

            total = 0;
            current = [];
        }

        current.push(split);

        total += len + sepLen;
    }

    // Add the remaining pieces
    if (current.length > 0) {
        docs.push(current.join(separator));
    }

    return docs;
}

/**
 * Splits raw text into chunks using different separators.
 *
 * Order:
 * 1. Paragraphs
 * 2. Lines
 * 3. Sentences
 * 4. Words
 * 5. Characters
 */
function splitText(text, chunkSize, chunkOverlap) {
    const chunks = [];

    for (const separator of SEPARATORS) {
        // Normal separators
        if (separator) {
            const splits = text
                .split(separator)
                .filter(Boolean);

            // This separator didn't actually split the text,
            // so try the next separator.
            if (splits.length === 1) {
                continue;
            }

            chunks.push(
                ...mergeSplits(
                    splits,
                    separator,
                    chunkSize
                )
            );
        }

        // Last fallback: split by characters
        else {
            for (
                let i = 0;
                i < text.length;
                i += chunkSize - chunkOverlap
            ) {
                chunks.push(
                    text.slice(i, i + chunkSize)
                );
            }
        }

        // Once we successfully created chunks,
        // stop trying other separators.
        if (chunks.length > 0) {
            break;
        }
    }

    // Remove empty chunks
    return chunks.filter(
        (chunk) => chunk.trim().length > 0
    );
}

/**
 * Main function for chunking normal text.
 */
export function chunkText(
    text,
    options = {}
) {
    const chunkSize =
        options.chunkSize ?? DEFAULT_CHUNK_SIZE;

    const chunkOverlap =
        options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;

    const parts = splitText(
        text.trim(),
        chunkSize,
        chunkOverlap
    );

    return parts.map((content, index) => ({
        index,
        content,
        metadata: options.metadata,
    }));
}

/**
 * Chunk a multi-page document such as a PDF.
 *
 * Each page is processed separately.
 * Chunks will never cross page boundaries.
 */
export function chunkPages(
    pages,
    options = {}
) {
    const chunks = [];

    let index = 0;

    for (
        let pageIndex = 0;
        pageIndex < pages.length;
        pageIndex++
    ) {
        const pageText =
            pages[pageIndex].trim();

        // Skip empty pages
        if (!pageText) {
            continue;
        }

        const pageChunks = chunkText(
            pageText,
            {
                ...options,

                // Page number starts from 1
                metadata: {
                    page: pageIndex + 1,
                },
            }
        );

        for (const chunk of pageChunks) {
            chunks.push({
                index,
                content: chunk.content,
                metadata: chunk.metadata,
            });

            index += 1;
        }
    }

    return chunks;
}
