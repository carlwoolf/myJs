quotePhrase
  = '"' @$nonQuoteChar* '"'
nonQuoteChar
  = escapedQuote / singleNonQuote
singleNonQuote
  = [^"]
// cannot handle escape backslash, so we escape quotes w forward slash
escapedQuote = '\\"'
