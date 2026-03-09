%% V-n Diagram — Next-Gen Carrier-Based Strike Fighter
%  AE 460B — Group 2
%
%  References:
%    [1] Nicolai, "Fundamentals of Aircraft and Airship Design, Vol. 1,"
%        Ch. 19, Sec. 19.2 — Structural Design Criteria (V-n diagram)
%    [2] MIL-A-8861B — Airplane Strength and Rigidity: Flight Loads
%    [3] Roskam, "Airplane Design," Part V
%    [4] AE460 MASTER SHEET.xlsx (source of truth)
%
%  Per RCR Section 5.1 (Flight Loads), this script produces composite
%  V-n diagrams (n vs. EAS) for four configurations:
%    1. Lightest weight (A2A landing bring-back), sea level
%    2. Lightest weight (A2A landing bring-back), 45,000 ft
%    3. Heaviest weight (Strike TOGW),            sea level
%    4. Heaviest weight (Strike TOGW),            45,000 ft
%
%  All airspeeds are in ft/s EAS (equivalent airspeed).
%  Gust loads use the Nicolai Eq. 19.1 discrete gust method with the
%  Pratt gust alleviation factor K_g.

clear; clc; close all;

%% ========================================================================
%  AIRCRAFT PARAMETERS — AE460 MASTER SHEET.xlsx
%  ========================================================================

% ---------- Weights ----------
% Heaviest: Strike TOGW (Mission Weight sheet)
W_heavy = 51752;       % [lb]

% Lightest: A2A bring-back (landing) weight per RFP Sec 3.2.2
%   = We + 25% Wf + 50% W_PL
%   = 24808 + 0.25*19308 + 0.50*5500 = 32,385 lb
W_light = 32385;       % [lb]

% ---------- Wing Geometry (WingLayout sheet) ----------
S       = 457;         % Wing planform area [ft^2]
b       = 45;          % Wing span [ft]
AR      = 4.431;       % Aspect ratio
c_bar   = 126.38/12;   % Mean aerodynamic chord [ft] (126.38 in)

% ---------- Aerodynamic Data ----------
CL_max  =  0.9;        % Max lift coefficient, clean (Maneuver sheet)
CL_min  = -0.9;        % Min lift coefficient (symmetric airfoil)

% ---------- Standard Atmosphere ----------
rho_SL  = 0.002378;    % Sea-level density [slug/ft^3]
rho_45k = 0.000462;    % Density at 45,000 ft [slug/ft^3]
g       = 32.174;      % Gravity [ft/s^2]

% ---------- Structural Limits (MIL-A-8861B, fighter) ----------
n_pos   =  7.5;        % Positive limit load factor
n_neg   = -3.0;        % Negative limit load factor
SF_ult  =  1.5;        % Ultimate safety factor

% ---------- Design Speeds [ft/s EAS] ----------
% V_C from Wing_Area_Sizing: Mach 0.81 at SL = 903 ft/s
% V_D per MIL-A-8861B: V_D >= 1.2*V_C (using 1.25 for margin)
V_C = 903;             % Design cruise speed [ft/s EAS]
V_D = round(1.25 * V_C);  % Design dive speed [ft/s EAS] = 1129

% ---------- MIL-A-8861B Gust Velocities U_de [ft/s] ----------
% SL–20,000 ft: U_B=66, U_C=50, U_D=25
% 50,000 ft:    U_B=38, U_C=25, U_D=12.5
% 45,000 ft (linear interpolation):
gust_data = struct( ...
    'SL',    struct('U_C', 50,   'U_D', 25), ...
    'alt45', struct('U_C', 29.2, 'U_D', 14.6));

% ---------- Derived: Lift-curve slope ----------
% Nicolai low-AR formula (incompressible):
CL_alpha = 2*pi*AR / (2 + sqrt(AR^2 + 4));  % [1/rad]

%% ========================================================================
%  BUILD AND PLOT FOUR V-n DIAGRAMS
%  ========================================================================

weights   = [W_light,  W_heavy];
wt_names  = {'Lightest — A2A Landing (32,385 lb)', ...
              'Heaviest — Strike TOGW (51,752 lb)'};
wt_short  = {'A2A Landing', 'Strike TOGW'};

alt_vals  = [0, 45000];
alt_names = {'Sea Level', '45,000 ft'};
rho_alt   = [rho_SL, rho_45k];
gust_set  = {'SL', 'alt45'};

V = linspace(0, V_D * 1.15, 2000);  % Speed vector [ft/s EAS]

% Colors
c_man  = {[0.00 0.45 0.74], [0.85 0.33 0.10]};   % maneuver: blue / orange
c_gust = {[0.30 0.68 0.92], [0.93 0.60 0.35]};   % gust: light blue / light orange

fig = figure('Position', [50 50 1400 1000], 'Color', 'w');

panel = 0;
for a = 1:2           % altitude loop
    for w = 1:2       % weight loop
        panel = panel + 1;
        subplot(2, 2, panel);
        hold on; grid on; box on;

        W  = weights(w);
        WS = W / S;
        U_C_gust = gust_data.(gust_set{a}).U_C;
        U_D_gust = gust_data.(gust_set{a}).U_D;

        % ===================== MANEUVER ENVELOPE =====================
        % EAS-based: n = rho_SL * V_EAS^2 * S * CL / (2*W)
        n_stall_pos = (rho_SL * V.^2 * S * CL_max) / (2*W);
        n_stall_neg = (rho_SL * V.^2 * S * CL_min) / (2*W);

        V_S1    = sqrt(2*W / (rho_SL * S * CL_max));     % 1-g stall [ft/s EAS]
        V_A     = V_S1 * sqrt(n_pos);                     % Corner speed
        V_Aneg  = V_S1 * sqrt(abs(n_neg));                % Neg corner speed

        % --- Positive boundary ---
        ip = V <= V_A & n_stall_pos <= n_pos;
        V_p = [V(ip), V_A, V_D, V_D];
        n_p = [n_stall_pos(ip), n_pos, n_pos, 0];

        % --- Negative boundary ---
        in_ = V <= V_Aneg & n_stall_neg >= n_neg;
        V_n = [V_D, V_D, V_Aneg, fliplr(V(in_))];
        n_n = [0, n_neg, n_neg, fliplr(n_stall_neg(in_))];

        % Full maneuver envelope
        V_env = [V_p, V_n];
        n_env = [n_p, n_n];

        fill(V_env, n_env, c_man{w}, 'FaceAlpha', 0.07, ...
             'EdgeColor', c_man{w}, 'LineWidth', 2.2, ...
             'DisplayName', 'Maneuver Envelope');

        % ===================== GUST ENVELOPE =========================
        % Nicolai Eq. 19.1: n = 1 +/- (K_g * CL_a * U_e * V_e)/(498*W/S)
        %   (with V_e in KEAS and U_e in ft/s)
        % Equivalent form in ft/s EAS:
        %   dn = K_g * rho_SL * CL_a * U_e * V_EAS / (2 * W/S)
        mu  = 2*WS / (rho_SL * c_bar * CL_alpha * g);
        K_g = 0.88 * mu / (5.3 + mu);

        dn_C = K_g * rho_SL * CL_alpha * U_C_gust * V_C / (2*WS);
        dn_D = K_g * rho_SL * CL_alpha * U_D_gust * V_D / (2*WS);

        V_gust = [0, V_C, V_D, V_D, V_C, 0];
        n_gust = [1, 1+dn_C, 1+dn_D, 1-dn_D, 1-dn_C, 1];

        plot(V_gust, n_gust, '--', 'Color', c_gust{w}, 'LineWidth', 1.8, ...
             'DisplayName', 'Gust Envelope');

        % ===================== ANNOTATIONS ===========================
        yline(0, 'k-', 'LineWidth', 0.5, 'HandleVisibility', 'off');
        yline(1, 'k:', 'LineWidth', 0.4, 'HandleVisibility', 'off');
        yline(n_pos, '-.', 'Color', [0.6 0 0], 'LineWidth', 0.8, ...
              'HandleVisibility', 'off');
        yline(n_neg, '-.', 'Color', [0.6 0 0], 'LineWidth', 0.8, ...
              'HandleVisibility', 'off');

        % Speed markers
        plot(V_S1, 1, 'kv', 'MarkerSize', 7, 'MarkerFaceColor', 'k', ...
             'HandleVisibility', 'off');
        plot(V_A, n_pos, 'o', 'Color', c_man{w}, 'MarkerSize', 7, ...
             'MarkerFaceColor', c_man{w}, 'HandleVisibility', 'off');

        text(V_S1, 1.5, sprintf('V_S=%.0f', V_S1), 'FontSize', 8, ...
             'HorizontalAlignment', 'center');
        text(V_A+12, n_pos-0.6, sprintf('V_A=%.0f', V_A), ...
             'FontSize', 8, 'Color', c_man{w});
        text(V_C, n_pos+0.9, sprintf('V_C=%d', V_C), 'FontSize', 8, ...
             'HorizontalAlignment', 'center', 'FontWeight', 'bold');
        text(V_D, n_pos+0.9, sprintf('V_D=%d', V_D), 'FontSize', 8, ...
             'HorizontalAlignment', 'center', 'FontWeight', 'bold');
        text(30, n_pos+0.35, sprintf('n^+_{lim}=+%.1fg', n_pos), ...
             'FontSize', 7, 'Color', [0.6 0 0]);
        text(30, n_neg-0.45, sprintf('n^-_{lim}=%.1fg', n_neg), ...
             'FontSize', 7, 'Color', [0.6 0 0]);

        xlabel('Equivalent Airspeed, V_{EAS} [ft/s]', 'FontSize', 10);
        ylabel('Load Factor, n_z [g]', 'FontSize', 10);
        title(sprintf('%s @ %s', wt_short{w}, alt_names{a}), 'FontSize', 11);
        xlim([0, V_D * 1.15]);
        ylim([n_neg - 2, n_pos + 2.5]);
        legend('Location', 'northwest', 'FontSize', 8);
        set(gca, 'FontSize', 9);

        % --- Summary ---
        fprintf('\n--- %s @ %s ---\n', wt_names{w}, alt_names{a});
        fprintf('  W = %.0f lb,  W/S = %.2f psf\n', W, WS);
        fprintf('  V_S = %.1f ft/s,  V_A = %.1f ft/s\n', V_S1, V_A);
        fprintf('  mu = %.2f,  K_g = %.4f\n', mu, K_g);
        fprintf('  dn(V_C) = %.3f,  dn(V_D) = %.3f\n', dn_C, dn_D);
        fprintf('  Gust n+ @V_C = %.3f,  Gust n- @V_C = %.3f\n', 1+dn_C, 1-dn_C);
    end
end

sgtitle({'V-n Diagrams — Next-Gen Carrier-Based Strike Fighter'; ...
         'MIL-A-8861B | AE 460B Group 2'}, ...
         'FontSize', 14, 'FontWeight', 'bold');

% --- Save ---
print('Vn_Diagrams_Composite', '-dpng', '-r300');
fprintf('\n=== V-n Diagrams saved. ===\n');
