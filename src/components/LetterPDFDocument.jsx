import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";

// Register Hind (simpler Devanagari font) to avoid rendering crashes
Font.register({
    family: "Hind",
    fonts: [
        {
            src: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/hind/Hind-Regular.ttf",
            fontWeight: "normal",
        },
        {
            src: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/hind/Hind-Bold.ttf",
            fontWeight: "bold",
        },
    ],
});

// Also register a Latin font for English text
Font.register({
    family: "NotoSans",
    fonts: [
        {
            src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
            fontWeight: "normal",
        },
        {
            src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
            fontWeight: "bold",
        },
    ],
});

// A4 dimensions: 595.28 x 841.89 points
const styles = StyleSheet.create({
    page: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 40,
        paddingRight: 40,
        fontFamily: "Hind",
        fontSize: 10,
        color: "#000000",
        lineHeight: 1.5,
        hyphenation: false,
    },

    // Header
    headerContainer: {
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "#ed7d31",
        paddingBottom: 8,
        marginBottom: 12,
    },
    companyName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ed7d31",
        textAlign: "center",
        fontFamily: "NotoSans",
        letterSpacing: 1,
    },
    headerDetail: {
        fontSize: 8,
        textAlign: "center",
        color: "#333333",
        marginTop: 2,
    },

    // Letter Info Row
    letterInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        marginTop: 6,
    },
    letterInfoText: {
        fontSize: 10,
        fontWeight: "bold",
    },

    // Recipient
    recipientBlock: {
        marginBottom: 8,
    },
    recipientLabel: {
        fontSize: 10,
        fontWeight: "bold",
        marginBottom: 2,
    },
    recipientIndented: {
        paddingLeft: 30,
        fontSize: 10,
        lineHeight: 1.6,
    },

    // Subject & Reference
    sectionBlock: {
        marginBottom: 8,
    },
    labelBold: {
        fontWeight: "bold",
        fontSize: 10,
    },
    bodyText: {
        fontSize: 10,
        textAlign: "left",
        lineHeight: 1.6,
        hyphenation: false,
    },
    referenceItem: {
        fontSize: 10,
        paddingLeft: 15,
        marginBottom: 2,
    },

    // Table
    tableContainer: {
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#000000",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000000",
    },
    tableRowLast: {
        flexDirection: "row",
    },
    tableHeaderRow: {
        flexDirection: "row",
        backgroundColor: "#f3f4f6",
        borderBottomWidth: 1,
        borderBottomColor: "#000000",
    },
    tableCell: {
        padding: 4,
        fontSize: 8,
        textAlign: "center",
        borderRightWidth: 1,
        borderRightColor: "#000000",
        flex: 1,
    },
    tableCellLast: {
        padding: 4,
        fontSize: 8,
        textAlign: "center",
        flex: 1,
    },
    tableHeaderCell: {
        padding: 4,
        fontSize: 8,
        fontWeight: "bold",
        textAlign: "center",
        borderRightWidth: 1,
        borderRightColor: "#000000",
        flex: 1,
    },
    tableHeaderCellLast: {
        padding: 4,
        fontSize: 8,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },

    // Closing
    closingText: {
        fontSize: 10,
        textAlign: "left",
        lineHeight: 1.6,
        marginTop: 8,
        hyphenation: false,
    },
    thankYou: {
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
    },

    // Signature
    signatureBlock: {
        marginTop: 30,
        alignItems: "flex-start",
    },
    signatureText: {
        fontSize: 10,
        fontWeight: "bold",
        marginBottom: 2,
    },

    // Copies To
    copiesBlock: {
        marginTop: 25,
        fontSize: 9,
    },
    copiesLabel: {
        fontWeight: "bold",
        marginBottom: 4,
    },
    copyItem: {
        fontSize: 9,
        paddingLeft: 15,
        marginBottom: 2,
    },

    // Footer
    footerContainer: {
        position: "absolute",
        bottom: 15,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: "#cccccc",
        paddingTop: 5,
        alignItems: "center",
    },
    footerText: {
        fontSize: 7,
        color: "#666666",
        textAlign: "center",
    },
});

const LetterPDFDocument = ({ headerInfo, letterInfo, tableColumns, tableData }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ===== HEADER ===== */}
                <View style={styles.headerContainer}>
                    <Text style={styles.companyName}>
                        {headerInfo.companyName || ""}
                    </Text>
                    <Text style={styles.headerDetail}>
                        {headerInfo.address || ""}
                    </Text>
                    {headerInfo.location ? (
                        <Text style={styles.headerDetail}>
                            {headerInfo.location}
                        </Text>
                    ) : null}
                    <Text style={styles.headerDetail}>
                        {headerInfo.contact || ""}
                    </Text>
                </View>

                {/* ===== LETTER NO & DATE ===== */}
                <View style={styles.letterInfoRow}>
                    <Text style={styles.letterInfoText}>
                        पत्र क्र.: {letterInfo.letterNo || ""}
                    </Text>
                    <Text style={styles.letterInfoText}>
                        दिनांक: {letterInfo.date || ""}
                    </Text>
                </View>

                {/* ===== RECIPIENT ===== */}
                <View style={styles.recipientBlock}>
                    <Text style={styles.recipientLabel}>प्रति,</Text>
                    <View style={styles.recipientIndented}>
                        <Text>{letterInfo.officerName || ""}</Text>
                        <Text>{letterInfo.department || ""}</Text>
                        <Text>{letterInfo.districtOffice || ""}</Text>
                    </View>
                </View>

                {/* ===== SUBJECT ===== */}
                <View style={styles.sectionBlock}>
                    <Text style={styles.bodyText}>
                        <Text style={styles.labelBold}>विषय:- </Text>
                        {letterInfo.subject || ""}
                    </Text>
                </View>

                {/* ===== REFERENCE ===== */}
                <View style={styles.sectionBlock}>
                    <Text style={styles.labelBold}>संदर्भ:-</Text>
                    {(letterInfo.reference || []).map((ref, idx) => (
                        <Text key={idx} style={styles.referenceItem}>
                            {idx + 1}. {ref}
                        </Text>
                    ))}
                </View>

                {/* ===== SALUTATION & INTRO ===== */}
                <View style={styles.sectionBlock}>
                    <Text style={styles.bodyText}>
                        {letterInfo.salutation || ""}
                    </Text>
                    <Text style={[styles.bodyText, { marginTop: 6 }]}>
                        {letterInfo.introParagraph || ""}
                    </Text>
                </View>

                {/* ===== DYNAMIC TABLE ===== */}
                {tableColumns && tableColumns.length > 0 && (
                    <View style={styles.tableContainer}>
                        {/* Table Header */}
                        <View style={styles.tableHeaderRow}>
                            {tableColumns.map((col, idx) => (
                                <Text
                                    key={idx}
                                    style={
                                        idx === tableColumns.length - 1
                                            ? styles.tableHeaderCellLast
                                            : styles.tableHeaderCell
                                    }
                                >
                                    {col}
                                </Text>
                            ))}
                        </View>

                        {/* Table Body */}
                        {(tableData || []).map((row, rowIdx) => (
                            <View
                                key={rowIdx}
                                style={
                                    rowIdx === (tableData || []).length - 1
                                        ? styles.tableRowLast
                                        : styles.tableRow
                                }
                            >
                                {tableColumns.map((col, colIdx) => (
                                    <Text
                                        key={colIdx}
                                        style={
                                            colIdx === tableColumns.length - 1
                                                ? styles.tableCellLast
                                                : styles.tableCell
                                        }
                                    >
                                        {row[col] || ""}
                                    </Text>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* ===== CLOSING PARAGRAPH ===== */}
                <Text style={styles.closingText}>
                    {letterInfo.closingParagraph || ""}
                </Text>

                {/* ===== THANK YOU ===== */}
                <Text style={styles.thankYou}>
                    {letterInfo.thankYou || ""}
                </Text>

                {/* ===== SIGNATURE ===== */}
                <View style={styles.signatureBlock}>
                    <Text style={styles.signatureText}>
                        {letterInfo.regards || ""}
                    </Text>
                    <Text style={[styles.signatureText, { marginTop: 25 }]}>
                        {letterInfo.forCompany || ""}
                    </Text>
                    <Text style={styles.signatureText}>
                        {letterInfo.designation || ""}
                    </Text>
                </View>

                {/* ===== COPIES TO ===== */}
                <View style={styles.copiesBlock}>
                    <Text style={styles.copiesLabel}>प्रतिलिपि:—</Text>
                    {(letterInfo.copiesTo || []).map((copy, idx) => (
                        <Text key={idx} style={styles.copyItem}>
                            {idx + 1}. {copy}
                        </Text>
                    ))}
                </View>

                {/* ===== FOOTER ===== */}
                <View style={styles.footerContainer} fixed>
                    <Text style={styles.footerText}>
                        {headerInfo.companyName || ""} | {headerInfo.address || ""} | {headerInfo.contact || ""}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default LetterPDFDocument;
