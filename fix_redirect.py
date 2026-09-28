import io

p = "src/main.tsx"
s = io.open(p, encoding="utf-8").read()

old = '''        {/* PAGE 3 — the working analysis page: run an investigation and read its report */}
        <Route
          path="/analysis"
          element={<PageTransition><Analysis /></PageTransition>}
        />'''
new = old + '''
        {/* The analysis page moved from /dashboard to /analysis — old links land here. */}
        <Route path="/dashboard" element={<Navigate to="/analysis" replace />} />'''

assert s.count(old) == 1, s.count(old)
s = s.replace(old, new, 1)
io.open(p, "w", encoding="utf-8").write(s)
print("OK redirect added")
