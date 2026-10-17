<?php
require_once __DIR__ . '/Config.Include.php';
function adminRequireAccount(): void {global $account_check;if(!$account_check){header('Location: ./',true,303);exit;}}
function adminText($value): string {return Security::html($value);}
function adminLines(array $values): string {return implode("\n",array_map('strval',$values));}
function adminIcon(string $name): string {
    $paths = [
        'overview'=>'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
        'player'=>'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',
        'interfaces'=>'<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><path d="M15 6h3v5M6 13v5h5M9 6h2M13 18h2"/>',
        'danmaku'=>'<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M7 9h10M7 13h6"/>',
        'help'=>'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>',
        'menu'=>'<path d="M4 6h16M4 12h16M4 18h16"/>',
        'theme'=>'<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none"/>',
        'save'=>'<path d="M5 3h12l4 4v14H3V3Zm2 0v6h10V3M7 21v-7h10v7"/>',
        'lock'=>'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
        'external'=>'<path d="M14 3h7v7M21 3 10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    ];
    return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'.($paths[$name]??$paths['help']).'</svg>';
}
function adminField(string $id,string $label,$value,string $help,array $options=[]): void {
    $type=$options['type']??'text';$class=!empty($options['wide'])?'field field-wide':'field';
    echo '<div class="'. $class .'"><label for="'.adminText($id).'">'.adminText($label).'</label>';
    $attributes=' id="'.adminText($id).'" name="'.adminText($id).'" aria-describedby="'.$id.'-help"';
    foreach(['placeholder','min','max','minlength','maxlength','pattern','autocomplete'] as $key)if(isset($options[$key]))$attributes.=' '.$key.'="'.adminText($options[$key]).'"';
    if(!empty($options['required']))$attributes.=' required';
    if(!empty($options['list']))$attributes.=' data-line-list="true"';
    if($type==='textarea')echo '<textarea'.$attributes.' rows="'.(int)($options['rows']??4).'">'.adminText($value).'</textarea>';
    else echo '<input'.$attributes.' type="'.adminText($type).'" value="'.adminText($value).'">';
    echo '<p class="field-help" id="'.$id.'-help">'.adminText($help).'</p></div>';
}
function adminToggle(string $id,string $label,$value,string $help): void {
    echo '<label class="toggle-field" for="'.$id.'"><span><strong>'.adminText($label).'</strong><small>'.adminText($help).'</small></span><input type="checkbox" id="'.$id.'" name="'.$id.'"'.($value?' checked':'').'><span class="switch" aria-hidden="true"></span></label>';
}
function adminSave(string $label='保存设置'): void {echo '<div class="form-actions"><p class="form-status" role="status" aria-live="polite">修改后请保存</p><button class="button primary" type="submit">'.adminIcon('save').'<span>'.adminText($label).'</span></button></div>';}
function adminStartGroup(string $title,string $description): void {echo '<section class="panel"><div class="section-heading"><h2>'.adminText($title).'</h2><p>'.adminText($description).'</p></div>';}
