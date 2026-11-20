import matplotlib.pyplot as plt
import matplotlib.patches as patches

def generate_floor_plan():
    # Modern, crisp architectural diagram
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    
    # Canvas coordinate system
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    
    # Outer room dimensions (x: 6 to 94, y: 6 to 64)
    rx, ry, rw, rh = 6, 6, 88, 58
    
    # Base floor fill
    floor = patches.Rectangle((rx, ry), rw, rh, linewidth=0, facecolor='#f8fafc')
    ax.add_patch(floor)

    # 1. Projector Screen (mounted on the front wall behind stage)
    screen_x, screen_y, screen_w, screen_h = 36, 62.8, 50, 2.0
    screen = patches.Rectangle((screen_x, screen_y), screen_w, screen_h,
                               linewidth=1.2, edgecolor='#0f172a', facecolor='#0f172a', zorder=3)
    ax.add_patch(screen)
    ax.text(screen_x + screen_w/2, screen_y + screen_h/2, "PROJECTOR SCREEN", 
            ha='center', va='center', fontsize=9, fontweight='bold', color='#ffffff', zorder=4)

    # 2. Stage (elevated front platform)
    stage_x, stage_y, stage_w, stage_h = 30, 46.5, 60, 13.5
    stage = patches.Rectangle((stage_x, stage_y), stage_w, stage_h,
                              linewidth=2, edgecolor='#475569', facecolor='#e2e8f0', zorder=2)
    ax.add_patch(stage)
    ax.text(stage_x + stage_w/2 + 7, stage_y + stage_h/2, "STAGE", 
            ha='center', va='center', fontsize=15, fontweight='bold', color='#334155', zorder=3)

    # 3. Rostrum (on the left side of the stage)
    rostrum_x, rostrum_y, rostrum_w, rostrum_h = 33, 48.5, 12, 9.5
    rostrum = patches.Rectangle((rostrum_x, rostrum_y), rostrum_w, rostrum_h,
                                linewidth=1.6, edgecolor='#1e293b', facecolor='#ffffff', zorder=4)
    ax.add_patch(rostrum)
    ax.text(rostrum_x + rostrum_w/2, rostrum_y + rostrum_h/2, "Rostrum", 
            ha='center', va='center', fontsize=11, fontweight='bold', color='#0f172a', zorder=5)

    # 4. Technical Desk (beside the stage on the left)
    tech_x, tech_y, tech_w, tech_h = 10, 46.5, 14.5, 13.5
    tech = patches.Rectangle((tech_x, tech_y), tech_w, tech_h,
                             linewidth=1.8, edgecolor='#475569', facecolor='#e2e8f0', zorder=2)
    ax.add_patch(tech)
    ax.text(tech_x + tech_w/2, tech_y + tech_h/2, "Technical", 
            ha='center', va='center', fontsize=12, fontweight='bold', color='#1e293b', zorder=3)

    # 5. Front Entrance (vertical rectangle along left wall, in front of technical)
    f_ent_x, f_ent_y, f_ent_w, f_ent_h = 4, 27.5, 4, 15
    f_ent_x, f_ent_y, f_ent_w, f_ent_h = 4, 33, 4, 14
    front_ent = patches.Rectangle((f_ent_x, f_ent_y), f_ent_w, f_ent_h,
                                  linewidth=2, edgecolor='#0f172a', facecolor='#ffffff', zorder=5)
    ax.add_patch(front_ent)
    ax.text(f_ent_x + f_ent_w/2, f_ent_y + f_ent_h/2, "Front Entrance", 
            ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0f172a', rotation=90, zorder=6)

    # 6. Registration Table (vertical rectangle beside the front entrance)
    reg_x, reg_y, reg_w, reg_h = 10.5, 26, 6.5, 17.5
    # 6. Registration Table (vertical rectangle moved down, to the right of front entrance)
    reg_x, reg_y, reg_w, reg_h = 10.5, 15, 6.5, 15
    reg_table = patches.Rectangle((reg_x, reg_y), reg_w, reg_h,
                                  linewidth=1.8, edgecolor='#334155', facecolor='#ffffff', zorder=3)
    ax.add_patch(reg_table)
    ax.text(reg_x + reg_w/2, reg_y + reg_h/2, "Registration\nTable", 
            ha='center', va='center', fontsize=10, fontweight='bold', color='#1e293b', rotation=90, zorder=4)

    # 7. Audience (single continuous area, no aisles)
    aud_x, aud_y, aud_w, aud_h = 24, 13, 66, 28
    audience = patches.Rectangle((aud_x, aud_y), aud_w, aud_h,
                                 linewidth=1.8, edgecolor='#94a3b8', facecolor='#edf2f7', zorder=2)
    ax.add_patch(audience)
    ax.text(aud_x + aud_w/2, aud_y + aud_h/2, "AUDIENCE", 
            ha='center', va='center', fontsize=18, fontweight='bold', color='#475569', zorder=3)

    # 8. Back Entrance (rear wall, to the right between center and corner)
    # x=50 is center, x=94 is corner -> between center and corner is x=68 to 82
    b_ent_x, b_ent_y, b_ent_w, b_ent_h = 68, 4, 15, 4
    # 8. Back Entrance (rear wall, moved to the left near the edge of the audience box)
    b_ent_x, b_ent_y, b_ent_w, b_ent_h = 20, 4, 15, 4
    back_ent = patches.Rectangle((b_ent_x, b_ent_y), b_ent_w, b_ent_h,
                                 linewidth=2, edgecolor='#0f172a', facecolor='#ffffff', zorder=5)
    ax.add_patch(back_ent)
    ax.text(b_ent_x + b_ent_w/2, b_ent_y + b_ent_h/2, "Back Entrance", 
            ha='center', va='center', fontsize=10, fontweight='bold', color='#0f172a', zorder=6)

    # Outer wall borders (with clean breaks for doorways)
    # Top wall:
    ax.plot([rx, rx + rw], [ry + rh, ry + rh], color='#1e293b', linewidth=2.5, zorder=1)
    # Right wall:
    ax.plot([rx + rw, rx + rw], [ry, ry + rh], color='#1e293b', linewidth=2.5, zorder=1)
    # Left wall (broken by front entrance):
    ax.plot([rx, rx], [ry + rh, f_ent_y + f_ent_h], color='#1e293b', linewidth=2.5, zorder=1)
    ax.plot([rx, rx], [f_ent_y, ry], color='#1e293b', linewidth=2.5, zorder=1)
    # Bottom wall (broken by back entrance):
    ax.plot([rx, b_ent_x], [ry, ry], color='#1e293b', linewidth=2.5, zorder=1)
    ax.plot([b_ent_x + b_ent_w, rx + rw], [ry, ry], color='#1e293b', linewidth=2.5, zorder=1)

    # Title header
    ax.text(50, 69, "EVENT FLOOR PLAN — BK1, BLOCK A, FCSIT", 
            ha='center', va='center', fontsize=13, fontweight='bold', color='#0f172a')

    # Coordinates setup
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 72)
    ax.axis('off')

    plt.tight_layout()
    output_path = "bk1_floor_plan.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved floor plan to {output_path}")

if __name__ == "__main__":
    generate_floor_plan()
