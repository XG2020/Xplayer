<?php
/** Literal blocked-word matching without optional mbstring or intl extensions. */
final class DanmakuFilter
{
    private array $words;

    public function __construct(string $blockedWords = '')
    {
        $normalized = self::normalizeList($blockedWords);
        $this->words = $normalized === '' ? [] : explode("\n", $normalized);
    }

    private static function matchingText(string $value): string
    {
        // U+FF01..U+FF5E map directly to printable ASCII; decode those three UTF-8
        // bytes ourselves so matching is identical with or without mbstring/intl.
        $value = preg_replace_callback('/[\x{FF01}-\x{FF5E}]/u', static function (array $match): string {
            $character = $match[0];
            $codepoint = ((ord($character[0]) & 0x0f) << 12) |
                ((ord($character[1]) & 0x3f) << 6) | (ord($character[2]) & 0x3f);
            return chr($codepoint - 0xfee0);
        }, $value);
        // Remove whitespace, format/zero-width characters, and invisible selectors
        // used to split advertising words. Never change the stored comment itself.
        $value = preg_replace('/[\s\p{Z}\p{Cf}\x{034F}\x{180B}-\x{180D}\x{FE00}-\x{FE0F}\x{E0100}-\x{E01EF}]+/u', '', $value);
        return strtolower($value);
    }

    public static function normalizeList(string $value): string
    {
        if (strlen($value) > 32768) throw new InvalidArgumentException('弹幕屏蔽词总长度不能超过 32768 字节');
        if (preg_match('//u', $value) !== 1) throw new InvalidArgumentException('弹幕屏蔽词编码不正确');
        $words = [];
        $seen = [];
        foreach (preg_split('/\R/u', $value) as $line) {
            $word = self::matchingText($line);
            if ($word === '') continue;
            if (preg_match('/\p{Cc}/u', $word)) throw new InvalidArgumentException('弹幕屏蔽词不能含控制字符');
            if (preg_match_all('/./us', $word) > 100) throw new InvalidArgumentException('每个弹幕屏蔽词最多 100 个字符');
            if (isset($seen[$word])) continue;
            $seen[$word] = true;
            $words[] = $word;
            if (count($words) > 200) throw new InvalidArgumentException('最多可设置 200 个弹幕屏蔽词');
        }
        return implode("\n", $words);
    }

    public function matches(string $value): bool
    {
        if (!$this->words) return false;
        if (preg_match('//u', $value) !== 1) throw new InvalidArgumentException('弹幕文字编码不正确');
        $value = self::matchingText($value);
        foreach ($this->words as $word) {
            if (str_contains($value, $word)) return true;
        }
        return false;
    }
}
